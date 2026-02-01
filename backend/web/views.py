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
from django.core.mail import send_mail
from django.conf import settings
from django.core.mail import send_mail
from django.conf import settings
from .models import BloodRequest, Donation, Inventory, DonorProfile

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
                'assigned_donor_id': r.assigned_donor_id,
                'units': 1, # Default or add to model
                'reason': r.additional_notes,
                'requester_email': r.requester_email,
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
            
                blood_request.assigned_donor_id = donor_id
                
                # Fetch donor details
                try:
                    donor_user = User.objects.get(id=donor_id)
                    donor_name = donor_user.first_name or donor_user.username
                    donor_phone = ""
                    try:
                        donor_phone = donor_user.profile.phone
                    except: pass

                    # Send Email to Requester
                    if blood_request.requester_email:
                        subject = f"Donor Allocated: BloodLife Request for {blood_request.blood_group}"
                        message = f"""
                        Dear Requester,
                        
                        We have allocated a donor for your blood request.
                        
                        Patient: {blood_request.patient_name}
                        Blood Group Requested: {blood_request.blood_group}
                        
                        Donor Details:
                        Name: {donor_name}
                        Contact Number: {donor_phone}
                        
                        Please contact the donor as soon as possible to coordinate the donation.
                        
                        Thank you,
                        BloodLife Team
                        """
                        
                        send_mail(
                            subject,
                            message,
                            settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@bloodlife.com',
                            [blood_request.requester_email],
                            fail_silently=False,
                        )
                        print(f"Allocation email sent to {blood_request.requester_email}")
                except User.DoesNotExist:
                    print(f"Donor with ID {donor_id} not found, skipping email.")
                except Exception as e:
                    print(f"Failed to send email: {e}")

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
                requester_email=data.get('email'),
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
                # Fetch profile data
                profile_data = {}
                try:
                    profile = user.profile
                    profile_data = {
                        'isEligible': profile.is_eligible,
                        'bloodGroup': profile.blood_group,
                        'phone': profile.phone,
                        'city': profile.city
                    }
                except DonorProfile.DoesNotExist:
                    profile_data = {'isEligible': False} # Default if missing
                    
                return JsonResponse({
                    'user': {
                        'id': user.id, 
                        'email': user.username, 
                        'role': 'admin' if user.is_staff else 'donor',
                        **profile_data
                    }
                })
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
            
            # Create Donor Profile
            DonorProfile.objects.create(user=user, is_eligible=False)
            
            login(request, user)
            return JsonResponse({'user': {'id': user.id, 'email': user.username, 'role': 'donor', 'isEligible': False}})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

class LogoutView(View):
    def post(self, request):
        logout(request)
        return JsonResponse({'success': 'Logged out'})

@method_decorator(csrf_exempt, name='dispatch')
class UpdateEligibilityView(View):
    def post(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Unauthorized'}, status=401)
            
        try:
            data = json.loads(request.body)
            # Find or create profile
            profile, created = DonorProfile.objects.get_or_create(user=request.user)
            
            is_eligible = data.get('isEligible', False)
            profile.is_eligible = is_eligible
            
            # Also update other profile fields if provided
            if 'bloodGroup' in data: profile.blood_group = data['bloodGroup']
            if 'phone' in data: profile.phone = data['phone']
            if 'city' in data: profile.city = data['city']
            if 'lastDonationDate' in data: profile.last_donation_date = data['lastDonationDate'] or None
            
            profile.save()
            
            return JsonResponse({'success': True, 'isEligible': profile.is_eligible})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

class UserView(View):
    def get(self, request):
        if request.user.is_authenticated:
            profile_data = {}
            try:
                profile = request.user.profile
                profile_data = {
                    'isEligible': profile.is_eligible,
                    'bloodGroup': profile.blood_group,
                    'phone': profile.phone,
                    'city': profile.city
                }
            except DonorProfile.DoesNotExist:
                 profile_data = {'isEligible': False}

            return JsonResponse({
                'user': {
                    'id': request.user.id, 
                    'email': request.user.username, 
                    'role': 'admin' if request.user.is_staff else 'donor',
                    **profile_data
                }
            })
        return JsonResponse({'user': None})

class DashboardStatsView(View):
    def get(self, request):
        if not request.user.is_staff: # Admin only
             return JsonResponse({'error': 'Unauthorized'}, status=401)
        
        total_donors = DonorProfile.objects.count()
        total_donations = Donation.objects.count()
        
        # Calculate total units from Inventory
        # Convert Decimal to float for JSON
        total_units = 0
        for item in Inventory.objects.all():
            total_units += float(item.units_available)
            
        # Eligible donors
        eligible_donors = DonorProfile.objects.filter(is_eligible=True).count()
        
        return JsonResponse({
            'totalDonors': total_donors,
            'totalDonations': total_donations,
            'totalUnits': total_units,
            'eligibleDonors': eligible_donors,
            'thisWeekDonors': 0, # Placeholder or implement date filtering
            'thisMonthDonors': 0,
            'lastMonthDonors': 0
        })
