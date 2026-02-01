import json
from django.utils import timezone
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.views.decorators.http import require_POST, require_GET
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView
from django.views import View
from .models import BloodRequest, Donation, Inventory

@method_decorator(csrf_exempt, name='dispatch')
class LogDonationView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            user = request.user
            
            if not user.is_authenticated:
                return JsonResponse({'error': 'Unauthorized'}, status=401)
                
            donation = Donation.objects.create(
                donor=user,
                units=data.get('units'),
                blood_group=data.get('bloodGroup'),
                center=data.get('center', ''),
                is_verified=False 
            )
            
            # Inventory update REMOVED. Now happens on verification.
            
            return JsonResponse({'success': True, 'id': donation.id})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

class GetPendingDonationsView(View):
    def get(self, request):
        # Admin check
        # if not request.user.is_staff: return JsonResponse({'error': 'Forbidden'}, status=403)
        
        pending_donations = Donation.objects.filter(is_verified=False).order_by('-donation_date')
        data = []
        for d in pending_donations:
            data.append({
                'id': d.id,
                'donor_name': d.donor.username,
                'units': str(d.units), # Decimal to string
                'blood_group': d.blood_group,
                'center': d.center,
                'date': d.donation_date.isoformat(),
            })
        return JsonResponse(data, safe=False)

@method_decorator(csrf_exempt, name='dispatch')
class VerifyDonationView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            donation_id = data.get('donationId')
            action = data.get('action') # 'approve' or 'reject'
            
            donation = Donation.objects.get(id=donation_id)
            
            if action == 'approve':
                donation.is_verified = True
                donation.verified_at = timezone.now()
                if request.user.is_authenticated:
                    donation.verified_by = request.user
                donation.save()
                
                # Update Inventory
                inventory, created = Inventory.objects.get_or_create(blood_group=donation.blood_group)
                # Ensure we handle Decimal conversions if needed, though Python handles mixing well usually.
                # But safer to match types
                inventory.units_available = float(inventory.units_available) + float(donation.units)
                inventory.save()
                
            elif action == 'reject':
                donation.delete() # Simple rejection logic
                
            return JsonResponse({'success': True})
        except Donation.DoesNotExist:
            return JsonResponse({'error': 'Donation not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

class DonorHistoryView(View):
    def get(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Unauthorized'}, status=401)
            
        donations = Donation.objects.filter(donor=request.user).order_by('-donation_date')
        data = []
        for d in donations:
            data.append({
                'id': d.id,
                'units': str(d.units), # Decimal to String
                'blood_group': d.blood_group,
                'center': d.center,
                'donation_date': d.donation_date.isoformat(),
                'is_verified': d.is_verified
            })
        return JsonResponse(data, safe=False)


class ReactAppView(TemplateView):
    template_name = "index.html"

class GetRequestsView(View):
    def get(self, request):
        requests = BloodRequest.objects.all().order_by('-created_at')
        data = []
        for r in requests:
            data.append({
                'id': r.id,
                'patient_name': r.patient_name,
                'blood_group': r.blood_group,
                'location': r.city, # Mapping city to location
                'status': r.status.lower(), # frontend expects lowercase
                'request_date': r.created_at.isoformat(),
                'assigned_donor_id': None, # We need to add this field to model if not present.
                'units': 1, # Default or add to model
                'reason': r.additional_notes,
                'requester_id': 'guest' 
            })
        return JsonResponse(data, safe=False)


class AllocateDonorView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            request_id = data.get('requestId')
            donor_id = data.get('donorId')
            status = data.get('status')
            
            blood_request = BloodRequest.objects.get(id=request_id)
            if status:
                blood_request.status = status.upper()
            
            if donor_id:
                blood_request.assigned_donor_id = donor_id 
            
            blood_request.save()
            
            return JsonResponse({'success': True})
        except BloodRequest.DoesNotExist:
            return JsonResponse({'error': 'Request not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

class RequestBloodView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            blood_request = BloodRequest.objects.create(
                patient_name=data.get('patientName'),
                blood_group=data.get('bloodGroup'),
                hospital=data.get('hospital'),
                city=data.get('city'),
                contact_number=data.get('contactNumber'),
                urgency=data.get('urgency'),
                additional_notes=data.get('additionalNotes', '')
            )
            return JsonResponse({'success': True, 'id': blood_request.id})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)



@method_decorator(ensure_csrf_cookie, name='dispatch')
class GetCSRFToken(View):
    def get(self, request):
        return JsonResponse({'success': 'CSRF cookie set'})

class LoginView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            username = data.get('email') # Using email as username
            password = data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                return JsonResponse({'user': {'id': user.id, 'email': user.username, 'role': 'admin' if user.is_staff else 'donor'}})
            return JsonResponse({'error': 'Invalid credentials'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

class RegisterView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            
            if User.objects.filter(username=email).exists():
                return JsonResponse({'error': 'User already exists'}, status=400)
            
            user = User.objects.create_user(username=email, email=email, password=password)
            login(request, user)
            return JsonResponse({'user': {'id': user.id, 'email': user.username, 'role': 'donor'}}) # Default role
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

class LogoutView(View):
    def post(self, request):
        logout(request)
        return JsonResponse({'success': 'Logged out'})

class UserView(View):
    def get(self, request):
        if request.user.is_authenticated:
            return JsonResponse({'user': {'id': request.user.id, 'email': request.user.username, 'role': 'admin' if request.user.is_staff else 'donor'}})
        return JsonResponse({'user': None})
