from django.db import models
from django.contrib.auth.models import User


class BloodRequest(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ALLOCATED', 'Allocated'),
        ('FULFILLED', 'Fulfilled'),
    ]
    
    URGENCY_CHOICES = [
        ('low', 'Standard'),
        ('medium', 'Urgent'),
        ('critical', 'Critical'),
    ]

    patient_name = models.CharField(max_length=100)
    blood_group = models.CharField(max_length=5)
    hospital = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    contact_number = models.CharField(max_length=20)
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES, default='medium')
    additional_notes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    assigned_donor_id = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient_name} - {self.blood_group} ({self.status})"

class Donation(models.Model):
    donor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='donations')
    units = models.DecimalField(max_digits=4, decimal_places=1)
    blood_group = models.CharField(max_length=5)
    center = models.CharField(max_length=200, blank=True)
    donation_date = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_donations')

    def __str__(self):
        return f"{self.donor.username} - {self.units} units ({self.donation_date})"

class Inventory(models.Model):
    blood_group = models.CharField(max_length=5, unique=True)
    units_available = models.DecimalField(max_digits=10, decimal_places=1, default=0)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.blood_group}: {self.units_available}"

class DonorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    blood_group = models.CharField(max_length=5, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    is_eligible = models.BooleanField(default=False)
    last_donation_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} Profile"
