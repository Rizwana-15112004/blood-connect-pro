import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User

def reset_password(username, new_password):
    try:
        user = User.objects.get(username=username)
        user.set_password(new_password)
        user.save()
        print(f"Successfully reset password for {username} to '{new_password}'")
    except User.DoesNotExist:
        print(f"User {username} not found. Creating...")
        if username == 'admin@example.com':
             User.objects.create_superuser(username, username, new_password)
             print(f"Created superuser {username}")
        else:
             User.objects.create_user(username, username, new_password)
             print(f"Created user {username}")

# Reset admin
reset_password('admin@example.com', 'admin')

# Reset/Create user laya
# Note: Database had laya@gmail.com, mock data had laya@example.com
# I will make sure laya@gmail.com exists with a known password.
reset_password('laya@gmail.com', '123456')

print("\nDone. Please try logging in with:")
print("Admin: admin@example.com / admin")
print("User: laya@gmail.com / 123456")
