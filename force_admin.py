import os
import sys
import django

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from web.models import DonorProfile

def fix():
    username = 'admin@bloodlife.com'
    email = 'admin@bloodlife.com'
    password = 'admin'

    # Clear any conflicting users
    User.objects.filter(username=username).delete()
    User.objects.filter(email=email).delete()
    User.objects.filter(username='admin').delete()

    # Create superuser
    user = User.objects.create_superuser(username=username, email=email, password=password)
    user.save()

    # Ensure profile exists
    DonorProfile.objects.get_or_create(
        user=user,
        defaults={
            'blood_group': 'O+',
            'is_eligible': True,
            'phone': '1234567890',
            'city': 'Admin City'
        }
    )

    print(f"SUCCESS: Created superuser '{username}' with password '{password}'")

if __name__ == "__main__":
    fix()
