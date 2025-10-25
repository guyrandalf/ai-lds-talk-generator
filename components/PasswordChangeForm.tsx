'use client'

import { useState, useTransition } from 'react'
import { changePassword } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Eye, EyeOff } from 'lucide-react'

export default function PasswordChangeForm() {
 const [isChanging, setIsChanging] = useState(false)
 const [isPending, startTransition] = useTransition()
 const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
 const [showPasswords, setShowPasswords] = useState({
 current: false,
 new: false,
 confirm: false
 })

 const handleSubmit = async (formData: FormData) => {
 startTransition(async () => {
 try {
 const result = await changePassword(formData)

 if (result.success) {
 setMessage({ type: 'success', text: 'Password changed successfully!' })
 setIsChanging(false)
 // Reset form
 const form = document.getElementById('password-form') as HTMLFormElement
 form?.reset()
 } else {
 setMessage({ type: 'error', text: result.error || 'Failed to change password' })
 }
 } catch {
 setMessage({ type: 'error', text: 'An unexpected error occurred' })
 }
 })
 }

 const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
 setShowPasswords(prev => ({
 ...prev,
 [field]: !prev[field]
 }))
 }

 return (
 <Card>
 <CardHeader>
 <div className="flex items-center justify-between">
 <div>
 <CardTitle>Security</CardTitle>
 <CardDescription>Manage your password and security settings</CardDescription>
 </div>
 </div>
 </CardHeader>
 <CardContent>
 {message && (
 <div className={`mb-4 p-4 rounded-lg ${message.type === 'success'
 ? 'bg-green-50 text-green-700 border border-green-200'
 : 'bg-red-50 text-red-700 border border-red-200'
 }`}>
 {message.text}
 </div>
 )}

 {isChanging ? (
 <form id="password-form" action={handleSubmit} className="space-y-6">
 <div className="space-y-2">
 <Label htmlFor="currentPassword">Current Password</Label>
 <div className="relative">
 <Input
 type={showPasswords.current ? 'text' : 'password'}
 id="currentPassword"
 name="currentPassword"
 required
 className="pr-12"
 placeholder="Enter your current password"
 />
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={() => togglePasswordVisibility('current')}
 className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
 >
 {showPasswords.current ? (
 <EyeOff className="h-4 w-4" />
 ) : (
 <Eye className="h-4 w-4" />
 )}
 </Button>
 </div>
 </div>

 <div className="space-y-2">
 <Label htmlFor="newPassword">New Password</Label>
 <div className="relative">
 <Input
 type={showPasswords.new ? 'text' : 'password'}
 id="newPassword"
 name="newPassword"
 required
 minLength={8}
 className="pr-12"
 placeholder="Enter your new password (min. 8 characters)"
 />
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={() => togglePasswordVisibility('new')}
 className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
 >
 {showPasswords.new ? (
 <EyeOff className="h-4 w-4" />
 ) : (
 <Eye className="h-4 w-4" />
 )}
 </Button>
 </div>
 </div>

 <div className="space-y-2">
 <Label htmlFor="confirmPassword">Confirm New Password</Label>
 <div className="relative">
 <Input
 type={showPasswords.confirm ? 'text' : 'password'}
 id="confirmPassword"
 name="confirmPassword"
 required
 minLength={8}
 className="pr-12"
 placeholder="Confirm your new password"
 />
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={() => togglePasswordVisibility('confirm')}
 className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
 >
 {showPasswords.confirm ? (
 <EyeOff className="h-4 w-4" />
 ) : (
 <Eye className="h-4 w-4" />
 )}
 </Button>
 </div>
 </div>

 <div className="flex items-center space-x-4">
 <Button
 type="submit"
 disabled={isPending}
 >
 {isPending ? 'Changing Password...' : 'Change Password'}
 </Button>
 <Button
 type="button"
 variant="outline"
 onClick={() => {
 setIsChanging(false)
 setMessage(null)
 const form = document.getElementById('password-form') as HTMLFormElement
 form?.reset()
 }}
 >
 Cancel
 </Button>
 </div>
 </form>
 ) : (
 <div className="space-y-4">
 <div className="flex items-center justify-between p-4 rounded-lg border">
 <div>
 <h3 className="font-medium">Password</h3>
 <p className="text-sm text-muted-foreground">Keep your account secure with a strong password</p>
 </div>
 <Button
 variant="ghost"
 onClick={() => {
 setIsChanging(true)
 setMessage(null)
 }}
 >
 Change Password
 </Button>
 </div>
 </div>
 )}
 </CardContent>
 </Card>
 )
}