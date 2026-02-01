from django.contrib.auth.models import User
try:
    u = User.objects.get(username='admin@bloodlife.com')
    u.set_password('admin')
    u.is_staff = True
    u.is_superuser = True
    u.save()
    print("User updated: admin@bloodlife.com / admin")
except User.DoesNotExist:
    User.objects.create_superuser('admin@bloodlife.com', 'admin@bloodlife.com', 'admin')
    print("User created: admin@bloodlife.com / admin")
