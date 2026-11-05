from django.db import models

# Owner: Pruthviraj
# TODO: Service (ListView/DetailView)


class ServiceCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "service categories"

    def __str__(self):
        return self.name
