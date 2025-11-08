import { colors, semanticColors, typography } from '@/lib/design-system';

export default function DesignSystemPage() {
  return (
    <div className="container mx-auto p-8 space-y-12">
      <div>
        <h1 className="font-h1-semibold mb-4">Town Pass 設計系統</h1>
        <p className="font-body-regular text-text-second">
          基於 design_docs/color_vars.md 的設計規範
        </p>
      </div>

      {/* Typography */}
      <section>
        <h2 className="font-h2-semibold mb-6">字體排版</h2>
        <div className="space-y-4">
          <div className="p-4 border border-grey-200 rounded-lg">
            <p className="font-h1-regular">H1 Regular - 標題一</p>
            <p className="font-h1-semibold">H1 Semibold - 標題一</p>
            <code className="text-xs text-grey-500">font-size: 36px, line-height: 48px</code>
          </div>
          <div className="p-4 border border-grey-200 rounded-lg">
            <p className="font-h2-regular">H2 Regular - 標題二</p>
            <p className="font-h2-semibold">H2 Semibold - 標題二</p>
            <code className="text-xs text-grey-500">font-size: 24px, line-height: 32px</code>
          </div>
          <div className="p-4 border border-grey-200 rounded-lg">
            <p className="font-h3-regular">H3 Regular - 標題三</p>
            <p className="font-h3-semibold">H3 Semibold - 標題三</p>
            <code className="text-xs text-grey-500">font-size: 16px, line-height: 22px</code>
          </div>
          <div className="p-4 border border-grey-200 rounded-lg">
            <p className="font-body-regular">Body Regular - 內文</p>
            <p className="font-body-semibold">Body Semibold - 內文</p>
            <code className="text-xs text-grey-500">font-size: 14px, line-height: 20px</code>
          </div>
          <div className="p-4 border border-grey-200 rounded-lg">
            <p className="font-caption-regular">Caption Regular - 說明文字</p>
            <code className="text-xs text-grey-500">font-size: 12px, line-height: 18px</code>
          </div>
        </div>
      </section>

      {/* Primary Colors */}
      <section>
        <h2 className="font-h2-semibold mb-6">Primary 主色</h2>
        <div className="grid grid-cols-11 gap-2">
          {Object.entries(colors.primary).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div 
                className="h-20 rounded-lg border border-grey-200"
                style={{ backgroundColor: value }}
              />
              <div className="text-xs">
                <div className="font-semibold">{key}</div>
                <div className="text-grey-500">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Secondary Colors */}
      <section>
        <h2 className="font-h2-semibold mb-6">Secondary 次要色</h2>
        <div className="grid grid-cols-11 gap-2">
          {Object.entries(colors.secondary).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div 
                className="h-20 rounded-lg border border-grey-200"
                style={{ backgroundColor: value }}
              />
              <div className="text-xs">
                <div className="font-semibold">{key}</div>
                <div className="text-grey-500">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Grey Colors */}
      <section>
        <h2 className="font-h2-semibold mb-6">Grey 灰階色</h2>
        <div className="grid grid-cols-11 gap-2">
          {Object.entries(colors.grey).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div 
                className="h-20 rounded-lg border border-grey-200"
                style={{ backgroundColor: value }}
              />
              <div className="text-xs">
                <div className="font-semibold">{key}</div>
                <div className="text-grey-500">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Status Colors */}
      <section>
        <h2 className="font-h2-semibold mb-6">狀態色</h2>
        <div className="grid grid-cols-5 gap-4">
          <div className="space-y-2">
            <div className="h-20 rounded-lg border border-grey-200 bg-red-500" />
            <div className="text-sm">
              <div className="font-semibold">Red 500</div>
              <div className="text-grey-500">Alarm</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-lg border border-grey-200 bg-red-300" />
            <div className="text-sm">
              <div className="font-semibold">Red 300</div>
              <div className="text-grey-500">Alarm Hover</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-lg border border-grey-200 bg-orange-500" />
            <div className="text-sm">
              <div className="font-semibold">Orange 500</div>
              <div className="text-grey-500">Reminder</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-lg border border-grey-200 bg-orange-300" />
            <div className="text-sm">
              <div className="font-semibold">Orange 300</div>
              <div className="text-grey-500">Reminder Hover</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-lg border border-grey-200 bg-green-500" />
            <div className="text-sm">
              <div className="font-semibold">Green 500</div>
              <div className="text-grey-500">Success</div>
            </div>
          </div>
        </div>
      </section>

      {/* Semantic Colors */}
      <section>
        <h2 className="font-h2-semibold mb-6">語意色彩</h2>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-h3-semibold">文字顏色</h3>
            <div className="space-y-2">
              <div className="p-4 border border-grey-200 rounded-lg">
                <p className="text-text-primary font-body-semibold">Primary Text - 主要文字</p>
                <code className="text-xs text-grey-500">{semanticColors.text.primary}</code>
              </div>
              <div className="p-4 border border-grey-200 rounded-lg">
                <p className="text-text-second font-body-regular">Second Text - 次要文字</p>
                <code className="text-xs text-grey-500">{semanticColors.text.second}</code>
              </div>
              <div className="p-4 border border-grey-200 rounded-lg">
                <p className="text-text-direction font-body-regular">Direction Text - 說明文字</p>
                <code className="text-xs text-grey-500">{semanticColors.text.direction}</code>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-h3-semibold">按鈕與提示</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 rounded-lg bg-alarm-default hover:bg-alarm-hover text-white font-body-semibold transition-colors">
                Alarm Button
              </button>
              <button className="w-full px-4 py-2 rounded-lg bg-reminder-default hover:bg-reminder-hover text-white font-body-semibold transition-colors">
                Reminder Button
              </button>
              <button className="w-full px-4 py-2 rounded-lg bg-disable text-grey-500 font-body-semibold cursor-not-allowed">
                Disabled Button
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tailwind Utility Classes */}
      <section>
        <h2 className="font-h2-semibold mb-6">Tailwind 工具類別</h2>
        <div className="p-6 bg-grey-50 rounded-lg">
          <h3 className="font-h3-semibold mb-4">可用的顏色類別：</h3>
          <div className="grid grid-cols-2 gap-4 font-caption-regular">
            <div>
              <h4 className="font-body-semibold mb-2">Primary</h4>
              <code className="block">bg-primary-{'{50-950}'}</code>
              <code className="block">text-primary-{'{50-950}'}</code>
              <code className="block">border-primary-{'{50-950}'}</code>
            </div>
            <div>
              <h4 className="font-body-semibold mb-2">Secondary</h4>
              <code className="block">bg-secondary-{'{50-950}'}</code>
              <code className="block">text-secondary-{'{50-950}'}</code>
              <code className="block">border-secondary-{'{50-950}'}</code>
            </div>
            <div>
              <h4 className="font-body-semibold mb-2">Grey</h4>
              <code className="block">bg-grey-{'{50-950}'}</code>
              <code className="block">text-grey-{'{50-950}'}</code>
              <code className="block">border-grey-{'{50-950}'}</code>
            </div>
            <div>
              <h4 className="font-body-semibold mb-2">Status</h4>
              <code className="block">bg-red-{'{300, 500}'}</code>
              <code className="block">bg-orange-{'{300, 500}'}</code>
              <code className="block">bg-green-500</code>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
