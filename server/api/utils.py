import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger('api')

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        logger.error(f"Непредвиденная ошибка сервера: {exc}", exc_info=True)
        return Response(
            {"detail": "Внутренняя ошибка сервера. Пожалуйста, попробуйте позже."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    elif response.status_code >= 500:
        logger.error(f"Ошибка сервера ({response.status_code}): {response.data}", exc_info=True)
        response.data['detail'] = "Внутренняя ошибка сервера. Пожалуйста, попробуйте позже."
    elif response.status_code >= 400:
        logger.warning(f"Ошибка клиента ({response.status_code}): {response.data}")
        if isinstance(response.data, dict) and 'detail' not in response.data:
            error_messages = []
            for field, errors in response.data.items():
                if isinstance(errors, list):
                    error_messages.append(f"{field}: {', '.join(errors)}")
                else:
                    error_messages.append(f"{field}: {errors}")
            response.data = {"detail": "Ошибка валидации запроса.", "errors": response.data}
        elif isinstance(response.data, list):
            response.data = {"detail": "Ошибка валидации запроса.", "errors": response.data}
    return response