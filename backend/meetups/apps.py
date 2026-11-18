from django.apps import AppConfig


class MeetupsConfig(AppConfig):
    name = "meetups"

    def ready(self):
        try:
            import pillow_heif

            pillow_heif.register_heif_opener()
        except ImportError:
            pass
