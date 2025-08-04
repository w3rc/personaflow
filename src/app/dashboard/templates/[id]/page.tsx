'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Loader2, Edit, Save, Copy, Trash2, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface Template {
  id: string
  name: string
  category: string
  disc_type: string
  template_content: string
  description?: string
  variables: string[]
  user_id?: string
  created_at?: string
  updated_at?: string
}

// Default templates data (moved outside component)
const defaultTemplates: Record<string, Template> = {
    'default-1': {
      id: 'default-1',
      name: 'Cold Email - D Type',
      category: 'email',
      disc_type: 'D',
      template_content: `Subject: Quick solution for [COMPANY] - 2 minute read

Hi [NAME],

I'll be direct: I have a solution that can increase [COMPANY]'s [METRIC] by [PERCENTAGE]% in [TIMEFRAME].

Key benefits:
• [BENEFIT_1] 
• [BENEFIT_2]
• [BENEFIT_3]

I know your time is valuable. Can we schedule a 15-minute call this week to discuss the details?

Best regards,
[YOUR_NAME]`,
      variables: ['NAME', 'COMPANY', 'METRIC', 'PERCENTAGE', 'TIMEFRAME', 'BENEFIT_1', 'BENEFIT_2', 'BENEFIT_3', 'YOUR_NAME']
    },
    'default-2': {
      id: 'default-2',
      name: 'Follow-up Email - I Type',
      category: 'email',
      disc_type: 'I',
      template_content: `Subject: Great meeting you at [EVENT]! 🎉

Hi [NAME]!

It was fantastic meeting you at [EVENT] yesterday! I really enjoyed our conversation about [TOPIC] - your insights were incredibly valuable.

As promised, I'm attaching [RESOURCE] that we discussed. I think you'll find it really helpful for [USE_CASE].

I'd love to continue our conversation over coffee sometime. Are you free next week for a quick chat? I have some exciting ideas I'd love to share with you!

Looking forward to hearing from you!

Cheers,
[YOUR_NAME]

P.S. Congratulations again on [ACHIEVEMENT]! 🎊`,
      variables: ['NAME', 'EVENT', 'TOPIC', 'RESOURCE', 'USE_CASE', 'ACHIEVEMENT', 'YOUR_NAME']
    }
    // Add other default templates as needed
  }

export default function TemplatePage() {
  const [template, setTemplate] = useState<Template | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    disc_type: '',
    template_content: '',
    description: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  const categories = [
    { id: 'email', name: 'Email' },
    { id: 'meeting', name: 'Meeting' },
    { id: 'sales', name: 'Sales' },
    { id: 'other', name: 'Other' }
  ]

  const discTypes = [
    { id: 'D', name: 'Dominance', color: 'bg-red-100 text-red-800' },
    { id: 'I', name: 'Influence', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'S', name: 'Steadiness', color: 'bg-green-100 text-green-800' },
    { id: 'C', name: 'Conscientiousness', color: 'bg-blue-100 text-blue-800' },
    { id: 'ALL', name: 'All Types', color: 'bg-gray-100 text-gray-800' }
  ]

  const loadTemplate = useCallback(async () => {
    try {
      setLoading(true)
      const templateId = params.id as string

      // Check if it's a default template first
      if (defaultTemplates[templateId]) {
        const defaultTemplate = defaultTemplates[templateId]
        setTemplate(defaultTemplate)
        setFormData({
          name: defaultTemplate.name,
          category: defaultTemplate.category,
          disc_type: defaultTemplate.disc_type,
          template_content: defaultTemplate.template_content,
          description: defaultTemplate.description || ''
        })
        setLoading(false)
        return
      }

      // Otherwise, fetch from database
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('communication_templates')
        .select('*')
        .eq('id', templateId)
        .eq('user_id', user.id)
        .single()

      if (error) {
        setError('Template not found')
        return
      }

      setTemplate(data)
      setFormData({
        name: data.name,
        category: data.category,
        disc_type: data.disc_type,
        template_content: data.template_content,
        description: data.description || ''
      })
    } catch (err: any) {
      setError(err.message || 'Failed to load template')
    } finally {
      setLoading(false)
    }
  }, [params.id, router, supabase])

  useEffect(() => {
    loadTemplate()
  }, [loadTemplate])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!template || template.id.startsWith('default-')) {
      setError('Cannot edit default templates')
      return
    }

    try {
      setSaving(true)
      setError('')

      const { error } = await supabase
        .from('communication_templates')
        .update({
          name: formData.name,
          category: formData.category,
          disc_type: formData.disc_type,
          template_content: formData.template_content,
          description: formData.description
        })
        .eq('id', template.id)

      if (error) {
        throw error
      }

      // Reload the template
      await loadTemplate()
      setIsEditing(false)
    } catch (err: any) {
      setError(err.message || 'Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!template || template.id.startsWith('default-')) {
      setError('Cannot delete default templates')
      return
    }

    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('communication_templates')
        .delete()
        .eq('id', template.id)

      if (error) {
        throw error
      }

      router.push('/dashboard/templates')
    } catch (err: any) {
      setError(err.message || 'Failed to delete template')
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(template?.template_content || '')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Template Not Found</h1>
          <p className="text-muted-foreground mb-4">The template you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/dashboard/templates">
            <Button>Back to Templates</Button>
          </Link>
        </div>
      </div>
    )
  }

  const discType = discTypes.find(d => d.id === template.disc_type)
  const category = categories.find(c => c.id === template.category)
  const isDefault = template.id.startsWith('default-')

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="flex h-16 items-center px-4 md:px-6">
          <Link href="/dashboard/templates" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Templates</span>
          </Link>
          <div className="ml-auto flex space-x-2">
            <Link href={`/dashboard/writing-assistant?template=${template.id}`}>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Use Template
              </Button>
            </Link>
            {!isDefault && (
              <>
                {isEditing ? (
                  <div className="flex space-x-2">
                    <Button onClick={handleSave} disabled={saving} size="sm">
                      {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)} size="sm">
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setIsEditing(true)} size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {error && (
          <div className="bg-destructive/15 border border-destructive/20 text-destructive px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    {isEditing ? (
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="text-2xl font-bold mb-2"
                      />
                    ) : (
                      <CardTitle className="text-2xl">{template.name}</CardTitle>
                    )}
                    {isEditing ? (
                      <Input
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Template description"
                      />
                    ) : (
                      template.description && (
                        <CardDescription>{template.description}</CardDescription>
                      )
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {discType && (
                      <Badge variant="secondary" className={discType.color}>
                        {discType.name}
                      </Badge>
                    )}
                    {category && (
                      <Badge variant="outline">
                        {category.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isEditing && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Category</Label>
                        <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>DISC Type</Label>
                        <Select value={formData.disc_type} onValueChange={(value) => handleInputChange('disc_type', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {discTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Template Content</Label>
                      <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    {isEditing ? (
                      <Textarea
                        value={formData.template_content}
                        onChange={(e) => handleInputChange('template_content', e.target.value)}
                        className="min-h-[400px] font-mono text-sm"
                      />
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm font-mono">
                          {template.template_content}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Template Variables</CardTitle>
                <CardDescription>
                  Variables that can be customized when using this template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {template.variables.map((variable) => (
                    <div key={variable} className="bg-gray-100 px-3 py-2 rounded text-sm font-mono">
                      [{variable}]
                    </div>
                  ))}
                  {template.variables.length === 0 && (
                    <p className="text-sm text-muted-foreground">No variables detected</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/dashboard/writing-assistant?template=${template.id}`} className="block">
                  <Button className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Use in Writing Assistant
                  </Button>
                </Link>
                <Button variant="outline" onClick={copyToClipboard} className="w-full">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Template
                </Button>
                {!isDefault && (
                  <Button variant="destructive" onClick={handleDelete} className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Template
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}