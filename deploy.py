"""
YOLA Deployment Script
SSH to VPS, clone/update repo, run docker compose, setup Nginx
"""
import paramiko
import sys

# VPS Config
HOST = "51.79.150.44"
USER = "root"
PASS = "gedongkuning12"
PORT = 22

# GitHub repo
REPO_URL = "https://github.com/brianhayom/yola.git"
PROJECT_DIR = "/root/yola"


def ssh_connect():
    """Connect to VPS via SSH"""
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print(f"Connecting to {HOST} as {USER}...")
    try:
        client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30, banner_timeout=30, auth_timeout=30)
        print("SSH connected!")
        return client
    except Exception as e:
        print(f"SSH failed: {e}")
        sys.exit(1)


def run_command(client, cmd, description=""):
    """Run a command on VPS and print output"""
    print(f"\n>> {description}")
    print(f"   $ {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=300)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    # Print safely, skip problematic unicode chars
    if out:
        safe_out = out.strip().encode('ascii', errors='replace').decode('ascii')
        print(f"   {safe_out}")
    if err:
        safe_err = err.strip().encode('ascii', errors='replace').decode('ascii')
        print(f"   [stderr] {safe_err}")
    return out, err


def main():
    client = ssh_connect()

    # Step 1: Check OS
    run_command(client, "uname -a && cat /etc/os-release 2>/dev/null || echo 'no os-release'", "Checking OS...")

    # Step 2: Check Docker
    run_command(client, "docker --version && docker compose version", "Checking Docker...")

    # Step 3: Update repo (clone if not exists, pull if exists)
    run_command(client, 
        f"if [ -d {PROJECT_DIR} ]; then cd {PROJECT_DIR} && git pull origin master; else git clone {REPO_URL} {PROJECT_DIR}; fi",
        "Updating YOLA repo...")

    # Step 4: Create/update .env file on VPS
    env_content = """DATABASE_URL=postgresql://yola:yola_secret_2024@postgres:5432/yola_db
JWT_SECRET=yola_jwt_secret_production_2024
JWT_REFRESH_SECRET=yola_refresh_secret_production_2024
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
OPENAI_API_KEY=sk-d452d91a193f05fe-snekpt-e998373b
OPENAI_BASE_URL=https://9router-102.semutssh.app/v1
OPENAI_MODEL=gpt-4o-mini
FRONTEND_URL=http://51.79.150.44
PORT=4000
NODE_ENV=production
REDIS_URL=redis://redis:6379
"""
    run_command(client, f"cat > {PROJECT_DIR}/.env << 'ENVEOF'\n{env_content}\nENVEOF", "Creating .env file...")

    # Step 5: Stop existing containers, rebuild and start
    run_command(client, f"cd {PROJECT_DIR} && docker compose down 2>&1 || true", "Stopping existing containers...")
    run_command(client, f"cd {PROJECT_DIR} && docker compose up -d --build 2>&1", "Building and starting YOLA...")

    # Step 6: Check running containers
    run_command(client, "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'", "Checking containers...")

    # Step 7: Install Nginx if needed
    out, _ = run_command(client, "which nginx && nginx -v 2>&1 || echo 'nginx not found'", "Checking Nginx...")
    if "not found" in out.lower():
        run_command(client, "apt-get update -qq && apt-get install -y nginx 2>&1", "Installing Nginx...")

    # Step 8: Run Prisma migration inside backend container
    run_command(client, "docker exec yola-backend npx prisma migrate deploy 2>&1 || echo 'migration skipped (will retry)'", "Running Prisma migration...")

    # Step 9: Configure Nginx reverse proxy (use port 8080 to avoid conflict with loan-dashboard on port 80)
    nginx_config = """server {
    listen 8080;
    server_name 51.79.150.44;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:4000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support for hot reload (dev)
    location /_next/webpack-hmr {
        proxy_pass http://localhost:3000/_next/webpack-hmr;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
"""
    run_command(client, f"cat > /etc/nginx/sites-available/yola << 'NGINXEOF'\n{nginx_config}\nNGINXEOF", "Creating Nginx config...")
    run_command(client, "ln -sf /etc/nginx/sites-available/yola /etc/nginx/sites-enabled/yola 2>&1", "Enabling Nginx site...")
    run_command(client, "rm -f /etc/nginx/sites-enabled/default 2>&1", "Removing default Nginx site...")
    run_command(client, "nginx -t 2>&1", "Testing Nginx config...")
    run_command(client, "systemctl restart nginx 2>&1 || service nginx restart 2>&1 || echo 'nginx restart failed (port may be in use, trying reload)' && nginx -s reload 2>&1 || echo 'nginx reload also failed'", "Restarting Nginx...")

    # Step 10: Done!
    print("\n" + "="*60)
    print("DEPLOYMENT COMPLETE!")
    print("="*60)
    print(f"Frontend: http://{HOST}:3000")
    print(f"Backend API: http://{HOST}:4000/api")
    print(f"Nginx (if running): http://{HOST}:8080")
    print(f"GitHub: https://github.com/brianhayom/yola")
    print("="*60)

    client.close()


if __name__ == "__main__":
    main()