# TownPass Frontend Docker Setup

This setup provides a containerized Next.js frontend application with Cloudflare Tunnel for secure web exposure.

## Prerequisites

1. Docker and Docker Compose installed
2. A Cloudflare account
3. A Cloudflare Tunnel token

## Setup Instructions

### 1. Create Cloudflare Tunnel

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Zero Trust** → **Access** → **Tunnels**
3. Click **Create a tunnel**
4. Choose **Cloudflared** and give your tunnel a name
5. Copy the tunnel token that's generated

### 2. Configure Environment

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Cloudflare tunnel token:
   ```
   CLOUDFLARE_TUNNEL_TOKEN=your-actual-tunnel-token-here
   ```

### 3. Run the Application

Start the services:
```bash
docker-compose up -d
```

This will:
- Build and start the Next.js frontend on port 3000
- Start the Cloudflare tunnel to expose the service to the web

### 4. Access the Application

- **Local access**: http://localhost:3000
- **Web access**: Through the Cloudflare tunnel URL (shown in Cloudflare dashboard)

## Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
# All services
docker-compose logs -f

# Frontend only
docker-compose logs -f frontend

# Tunnel only
docker-compose logs -f cloudflared
```

### Rebuild and restart
```bash
docker-compose down
docker-compose up -d --build
```

## Service Details

- **frontend**: Next.js application running on port 3000
- **cloudflared**: Cloudflare tunnel client that exposes the frontend to the web

## Troubleshooting

1. **Tunnel not connecting**: Verify your `CLOUDFLARE_TUNNEL_TOKEN` is correct
2. **Build failures**: Make sure all dependencies are properly installed locally first
3. **Port conflicts**: Change the port mapping in `docker-compose.yml` if port 3000 is in use

## Security Notes

- The Cloudflare tunnel provides secure access without opening firewall ports
- Environment variables containing sensitive tokens should never be committed to version control
- Always use the `.env` file for sensitive configuration
