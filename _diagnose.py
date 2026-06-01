import paramiko
HOST='145.79.212.201';PORT=65002;USER='u276796116';PASSWORD='Jyoti@45j'
ROOT='/home/u276796116/domains/aquamarine-duck-253716.hostingersite.com'
def run(ssh,c,l=None):
    print(f"\n=== {l or c} ===")
    _,o,e=ssh.exec_command(c,timeout=30)
    print(o.read().decode(errors='replace')[:3500])
    er=e.read().decode(errors='replace').strip()
    if er: print(f"[err] {er[:500]}")
ssh=paramiko.SSHClient();ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST,port=PORT,username=USER,password=PASSWORD,timeout=15)
run(ssh,f'tail -50 {ROOT}/laravel-app/storage/logs/laravel.log 2>&1','laravel.log tail')
run(ssh,f'ls -la {ROOT}/laravel-app/storage/logs/','log dir')
run(ssh,f'tail -30 ~/error_log 2>&1','home error_log')
ssh.close()
