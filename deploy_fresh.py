import os
import sys
import tarfile
import time
import subprocess
import paramiko

# Configurations
HOST = '91.108.107.48'
PORT = 65002
USER = 'u190964958'
PASSWORD = 'Jyoti1@2003'
SITE = 'off-kilt.com'
ROOT = f'/home/u190964958/domains/{SITE}'
LARAVEL = f'{ROOT}/laravel-app'
LOCAL_TAR = os.path.join(os.path.dirname(__file__), 'backend.tar.gz')
REMOTE_TAR = f'{ROOT}/backend.tar.gz'

def run(ssh, cmd, label=None, check=True):
    print(f"\n$ {label or cmd}")
    _, out, err = ssh.exec_command(cmd, timeout=300)
    o = out.read().decode(errors='replace').strip()
    e = err.read().decode(errors='replace').strip()
    rc = out.channel.recv_exit_status()
    if o: print(o[:3000])
    if e: print(f"[stderr] {e[:1500]}")
    if check and rc != 0:
        print(f"!! Command failed with exit code {rc}")
        sys.exit(rc)
    return rc, o, e

def build_frontend():
    print("Building frontend locally...")
    res = subprocess.run(['npm', 'run', 'build'], shell=True, cwd=os.path.dirname(__file__))
    if res.returncode != 0:
        print("Frontend build failed!")
        sys.exit(res.returncode)
    print("Frontend built successfully.")

def package_backend():
    print("Packaging backend...")
    
    def tar_filter(tarinfo):
        path = tarinfo.name
        path_norm = path.replace('\\', '/')
        
        # Exclude large archive/zip files or video files
        if path_norm.endswith('.zip') or path_norm.endswith('.mp4') or '/videos/' in path_norm or 'public/videos' in path_norm:
            return None
            
        parts = path_norm.split('/')
        
        # Exclude directories/files
        exclude_set = {
            'node_modules',
            'vendor',
            '.git',
            '.env',
            'tests',
            '.env.example',
            'storage/logs',
            'storage/framework/cache/data',
            'storage/framework/sessions',
            'storage/framework/views'
        }
        
        for exc in exclude_set:
            exc_parts = exc.split('/')
            # Check if exc_parts is a prefix of parts (after removing any leading '.')
            clean_parts = parts[1:] if parts[0] == '.' else parts
            if len(clean_parts) >= len(exc_parts) and clean_parts[:len(exc_parts)] == exc_parts:
                # If it's the exact directory, we want to keep the directory itself empty,
                # but exclude any children.
                if len(clean_parts) > len(exc_parts):
                    return None
                # Also completely exclude node_modules, vendor, .git, .env
                if exc in ['node_modules', 'vendor', '.git', '.env']:
                    return None
                    
        return tarinfo

    with tarfile.open(LOCAL_TAR, 'w:gz') as tar:
        tar.add('backend', arcname='.', filter=tar_filter)
    
    print(f"Backend packaged successfully. Size: {os.path.getsize(LOCAL_TAR)/1e6:.2f} MB")

def upload_backend():
    print("Connecting via SFTP...")
    t = paramiko.Transport((HOST, PORT))
    t.connect(username=USER, password=PASSWORD)
    sftp = paramiko.SFTPClient.from_transport(t)
    
    print(f"Uploading {LOCAL_TAR} -> {REMOTE_TAR} ...")
    t0 = time.time()
    def cb(sent, total):
        pct = sent * 100 / total
        sys.stdout.write(f"\r  {sent/1e6:6.2f} / {total/1e6:.2f} MB ({pct:5.1f}%)")
        sys.stdout.flush()
    sftp.put(LOCAL_TAR, REMOTE_TAR, callback=cb)
    print(f"\nUploaded in {time.time()-t0:.1f}s")
    sftp.close()
    t.close()

def main():
    build_frontend()
    package_backend()
    upload_backend()
    
    print("Connecting via SSH...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, port=PORT, username=USER, password=PASSWORD, timeout=15)
    
    # Backup videos and settings remotely to preserve them
    run(ssh, f'mkdir -p {ROOT}/tmp_videos && cp -r {LARAVEL}/public/videos {ROOT}/tmp_videos/ 2>/dev/null || true', 'Backup public videos')
    run(ssh, f'mkdir -p {ROOT}/tmp_build_videos && cp -r {LARAVEL}/public/build/videos {ROOT}/tmp_build_videos/ 2>/dev/null || true', 'Backup public build videos')
    run(ssh, f'mkdir -p {ROOT}/tmp_settings && cp -r {LARAVEL}/storage/app/*.json {ROOT}/tmp_settings/ 2>/dev/null || true', 'Backup app settings json files')

    # Clean previous laravel-app if any, and create directory
    run(ssh, f'rm -rf {LARAVEL} && mkdir -p {LARAVEL}', 'Recreate remote laravel-app directory')
    
    # Extract
    run(ssh, f'tar -xzf {REMOTE_TAR} -C {LARAVEL}', 'Extract backend on remote server')
    run(ssh, f'rm -f {REMOTE_TAR}', 'Remove remote tarball')
    
    # Restore videos and settings remotely
    run(ssh, f'mkdir -p {LARAVEL}/public/videos && cp -r {ROOT}/tmp_videos/videos/* {LARAVEL}/public/videos/ 2>/dev/null || true', 'Restore public videos')
    run(ssh, f'mkdir -p {LARAVEL}/public/build/videos && cp -r {ROOT}/tmp_build_videos/videos/* {LARAVEL}/public/build/videos/ 2>/dev/null || true', 'Restore public build videos')
    run(ssh, f'mkdir -p {LARAVEL}/storage/app && cp -r {ROOT}/tmp_settings/*.json {LARAVEL}/storage/app/ 2>/dev/null || true', 'Restore app settings json files')
    run(ssh, f'rm -rf {ROOT}/tmp_videos {ROOT}/tmp_build_videos {ROOT}/tmp_settings', 'Cleanup remote backups')
    
    # Load secrets from local backend/.env
    brevo_key = ""
    shiprocket_email = ""
    shiprocket_pass = ""
    
    local_env_path = os.path.join(os.path.dirname(__file__), 'backend', '.env')
    if os.path.exists(local_env_path):
        with open(local_env_path, 'r', encoding='utf-8') as lf:
            for line in lf:
                line = line.strip()
                if line.startswith('BREVO_API_KEY='):
                    brevo_key = line.split('=', 1)[1]
                elif line.startswith('SHIPROCKET_EMAIL='):
                    shiprocket_email = line.split('=', 1)[1]
                elif line.startswith('SHIPROCKET_PASSWORD='):
                    shiprocket_pass = line.split('=', 1)[1]

    # Create .env
    env_content = f"""APP_NAME=Offkilt
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=http://off-kilt.com
FRONTEND_URL=http://off-kilt.com

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=u190964958_Ecom40
DB_USERNAME=u190964958_Ecom40
DB_PASSWORD=Ecom40@1234

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

BREVO_API_KEY={brevo_key}
SHIPROCKET_EMAIL={shiprocket_email}
SHIPROCKET_PASSWORD={shiprocket_pass}
"""
    
    # Write .env remotely
    print("Writing remote .env file...")
    sftp_ssh = ssh.open_sftp()
    with sftp_ssh.file(f"{LARAVEL}/.env", "w") as f:
        f.write(env_content)
    sftp_ssh.close()
    
    # Install composer dependencies
    run(ssh, f'cd {LARAVEL} && composer install --no-dev --optimize-autoloader', 'Composer Install')
    
    # Generate App Key
    run(ssh, f'cd {LARAVEL} && php artisan key:generate', 'Generate Application Key')
    
    # Storage link
    run(ssh, f'ln -sf {LARAVEL}/storage/app/public {LARAVEL}/public/storage', 'Artisan storage link (manual)')
    
    # Run Migrations
    run(ssh, f'cd {LARAVEL} && php artisan migrate --force', 'Artisan Migrate')
    
    # Re-create Admin User
    run(ssh, f'cd {LARAVEL} && php create_admin.php', 'Create Admin User')
    
    # Set permissions
    run(ssh, f'chmod -R 775 {LARAVEL}/storage {LARAVEL}/bootstrap/cache', 'Set storage & cache permissions')
    
    # Optimize config & routes
    run(ssh, f'cd {LARAVEL} && php artisan config:cache && php artisan route:cache && php artisan view:cache', 'Cache Laravel Config, Routes, Views')
    
    # Symlink public_html
    # Remove existing public_html folder if it is empty, or backup if not.
    # Note: checking if public_html is a symlink or directory.
    print("\nSetting up public_html mapping...")
    run(ssh, f'if [ -d "{ROOT}/public_html" ] && [ ! -L "{ROOT}/public_html" ]; then rmdir "{ROOT}/public_html" || mv "{ROOT}/public_html" "{ROOT}/public_html.bak.{int(time.time())}"; fi', 'Backup/Remove public_html directory if not link')
    run(ssh, f'ln -sf {LARAVEL}/public {ROOT}/public_html', 'Link public_html to laravel-app/public')
    
    # Verification
    run(ssh, f'ls -la {ROOT}/public_html/', 'Verify public_html target contents')
    run(ssh, f'readlink -f {ROOT}/public_html', 'Verify symlink target path')
    
    ssh.close()
    print("\nFresh Deployment Done Successfully!")

if __name__ == '__main__':
    main()
