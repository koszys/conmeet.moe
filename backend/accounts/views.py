from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import UserSerializer, UserUpdateSerializer


@api_view(["GET"])
def health(request: Request) -> Response:
    return Response({"status": "ok"})


class MeView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request: Request) -> Response:
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request: Request) -> Response:
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        return Response(status=204)
