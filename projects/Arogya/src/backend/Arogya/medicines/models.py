from django.db import models
from django.contrib.auth.models import User
# Create your models here.
class Medicine(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='medicines')
    name = models.CharField(max_length=100)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    reminder_time = models.TimeField()
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    instructions = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name