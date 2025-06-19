from django.db import models
from django.core.validators import MinValueValidator
from django.contrib.auth.models import User

class Brigade(models.Model):
    brigade = models.IntegerField(
        null=False,
        blank=False,
        unique=True,
        validators=[MinValueValidator(1)],
        verbose_name="Номер бригады"
    )

    class Meta:
        verbose_name = "Бригада"
        verbose_name_plural = "Бригады"
        ordering = ['brigade']
        db_table = 'Brigade'

    def __str__(self):
        return f"Бригада №{self.brigade}"

class Location(models.Model):
    location = models.CharField(max_length=64, null=False, blank=False, unique=True, verbose_name="Местоположение")

    class Meta:
        verbose_name = "Местоположение"
        verbose_name_plural = "Местоположения"
        ordering = ['location']
        db_table = 'Location'

    def __str__(self):
        return self.location

class Object(models.Model):
    object = models.CharField(max_length=64, null=False, blank=False, unique=True, verbose_name="Название объекта")

    class Meta:
        verbose_name = "Объект"
        verbose_name_plural = "Объекты"
        ordering = ['object']
        db_table = 'Object'

    def __str__(self):
        return self.object

class Status(models.Model):
    status = models.CharField(max_length=32, null=False, blank=False, unique=True, verbose_name="Статус закрытия заявки")

    class Meta:
        verbose_name = "Статус"
        verbose_name_plural = "Статусы"
        ordering = ['status']
        db_table = 'Status'

    def __str__(self):
        return self.status

class Application(models.Model):
    brigade = models.ForeignKey(
        Brigade,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='applications',
        verbose_name="Бригада"
    )
    location = models.ForeignKey(
        Location,
        on_delete=models.CASCADE,
        null=False,
        blank=False,
        related_name='applications',
        verbose_name="Местоположение"
    )
    identifier = models.CharField(max_length=16, null=False, blank=False, unique=True, verbose_name="Идентификатор заявки")
    correction = models.TextField(null=True, blank=True, verbose_name="Примечание к заявке")
    object_instance = models.ForeignKey(
        Object,
        on_delete=models.CASCADE,
        null=False,
        blank=False,
        related_name='applications',
        verbose_name="Объект"
    )
    status = models.ForeignKey(
        Status,
        on_delete=models.CASCADE,
        null=False,
        blank=False,
        related_name='applications',
        verbose_name="Статус"
    )
    start_time = models.DateTimeField(null=False, blank=False, verbose_name="Время возникновения заявки")
    end_time = models.DateTimeField(null=True, blank=True, verbose_name="Время закрытия заявки")

    class Meta:
        verbose_name = "Заявка"
        verbose_name_plural = "Заявки"
        ordering = ['-start_time']
        db_table = 'Application'

    def __str__(self):
        return f"Заявка {self.identifier} ({self.object_instance.object})"