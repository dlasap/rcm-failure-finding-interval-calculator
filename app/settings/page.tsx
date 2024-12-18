'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useSettings } from '@/lib/settings-context'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const currencies = [
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'JPY', label: 'Japanese Yen (¥)' },
]

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings()
  const [currency, setCurrency] = useState(settings.currency)
  const [darkMode, setDarkMode] = useState(settings.darkMode)
  const [decimalSeparator, setDecimalSeparator] = useState(settings.decimalSeparator)
  const router = useRouter()

  useEffect(() => {
    setCurrency(settings.currency)
    setDarkMode(settings.darkMode)
    setDecimalSeparator(settings.decimalSeparator)
  }, [settings])

  const handleSave = () => {
    updateSettings({ currency, darkMode, decimalSeparator })
    router.push('/')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-primary">Settings</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
            <Label htmlFor="dark-mode">Dark Mode</Label>
          </div>
          <div className="space-y-2">
            <Label>Decimal Separator</Label>
            <RadioGroup
              value={decimalSeparator}
              onValueChange={(value) => setDecimalSeparator(value as '.' | ',')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="." id="decimal-dot" />
                <Label htmlFor="decimal-dot">Dot (.)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="," id="decimal-comma" />
                <Label htmlFor="decimal-comma">Comma (,)</Label>
              </div>
            </RadioGroup>
          </div>
          <Button onClick={handleSave} className="w-full">Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  )
}

