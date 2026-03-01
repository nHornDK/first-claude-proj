FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Dendo.DataContext/Dendo.DataContext.csproj Dendo.DataContext/
COPY Dendo.Api/Dendo.Api.csproj Dendo.Api/
RUN dotnet restore Dendo.Api/Dendo.Api.csproj

COPY Dendo.DataContext/ Dendo.DataContext/
COPY Dendo.Api/ Dendo.Api/
RUN dotnet publish Dendo.Api/Dendo.Api.csproj -c Release -o /app/publish --no-restore


FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 80
# EXPOSE 443
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Dendo.Api.dll"]
