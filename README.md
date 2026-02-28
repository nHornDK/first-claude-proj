# first-claude-proj

Full-stack application with a C# WebAPI backend and React TypeScript frontend.

## Structure

```
first-claude-proj/
├── backend/
│   └── Api/          # ASP.NET Core Web API + Entity Framework Core
├── frontend/         # Vite + React + TypeScript
└── docs/             # Project documentation
```

## Getting started

### Backend

```bash
cd backend/Api
dotnet run
```

Runs on https://localhost:5001 by default.

> Update the `ConnectionStrings:DefaultConnection` in `appsettings.json` before running.
> After updating, create the initial migration:
> ```bash
> dotnet ef migrations add InitialCreate
> dotnet ef database update
> ```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on http://localhost:5173 by default.
