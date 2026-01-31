import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_POST, require_GET
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView
from django.views import View

class ReactAppView(TemplateView):
    template_name = "index.html"

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
