from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class DischargeReport(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')
    file = models.FileField(upload_to='reports/')
    extracted_text = models.TextField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - Report {self.id}"