"""執行資料庫遷移腳本"""
import subprocess
import sys

def run_migration():
    print("正在執行資料庫遷移...")
    
    # 檢查當前版本
    print("\n1. 檢查當前資料庫版本:")
    result = subprocess.run([sys.executable, "-m", "alembic", "current"], 
                          capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print(result.stderr)
    
    # 顯示遷移歷史
    print("\n2. 顯示遷移歷史:")
    result = subprocess.run([sys.executable, "-m", "alembic", "history"], 
                          capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print(result.stderr)
    
    # 執行遷移到最新版本
    print("\n3. 執行遷移到最新版本:")
    result = subprocess.run([sys.executable, "-m", "alembic", "upgrade", "head"], 
                          capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print(result.stderr)
    
    if result.returncode == 0:
        print("\n✅ 遷移成功完成!")
        
        # 再次檢查當前版本
        print("\n4. 確認當前版本:")
        result = subprocess.run([sys.executable, "-m", "alembic", "current"], 
                              capture_output=True, text=True)
        print(result.stdout)
    else:
        print("\n❌ 遷移失敗!")
        return False
    
    return True

if __name__ == "__main__":
    run_migration()
