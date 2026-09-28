import sys

with open('frontend/src/app/(dashboard)/customer/layout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "import { useAuthStore } from '@/hooks/use-auth-store';",
    "import { useAuthStore } from '@/hooks/use-auth-store';\nimport { fetchApi } from '@/lib/api';"
)

content = content.replace(
    "const [isChecking, setIsChecking] = useState(true);",
    "const [isChecking, setIsChecking] = useState(true);\n  const [unreadCount, setUnreadCount] = useState(0);"
)

old_effect_end = "setIsChecking(false);\n  }, [router]);"
new_effect_end = '''setIsChecking(false);
    if (hasToken) {
      fetchApi('/notifications/me').then(data => {
        if (Array.isArray(data)) {
          setUnreadCount(data.filter(n => !n.isRead).length);
        }
      }).catch(e => {});
    }
  }, [router]);'''

content = content.replace(old_effect_end, new_effect_end)

old_wallet = '<Link href="/customer/wallet"'
new_wallet = '''<Link href="/customer/notifications" className="relative p-1.5 text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                {unreadCount}
              </span>
            )}
          </Link>
          <Link href="/customer/wallet"'''

content = content.replace(old_wallet, new_wallet)

with open('frontend/src/app/(dashboard)/customer/layout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
