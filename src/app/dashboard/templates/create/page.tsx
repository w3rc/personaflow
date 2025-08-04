'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Loader2, Plus, X, HelpCircle } from 'lucide-react'
import Link from 'next/link'

export default function CreateTemplate() {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    disc_type: '',
    template_content: '',
    description: ''
  })
  const [variables, setVariables] = useState<string[]>([])
  const [newVariable, setNewVariable] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const categories = [
    { id: 'email', name: 'Email' },
    { id: 'meeting', name: 'Meeting' },
    { id: 'sales', name: 'Sales' },
    { id: 'other', name: 'Other' }
  ]

  const discTypes = [
    { id: 'D', name: 'Dominance (Direct, Results-oriented)' },
    { id: 'I', name: 'Influence (Enthusiastic, People-focused)' },
    { id: 'S', name: 'Steadiness (Patient, Supportive)' },
    { id: 'C', name: 'Conscientiousness (Analytical, Detailed)' },
    { id: 'ALL', name: 'All Types (Universal)' }
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addVariable = () => {
    if (newVariable.trim() && !variables.includes(newVariable.trim().toUpperCase())) {
      setVariables(prev => [...prev, newVariable.trim().toUpperCase()])
      setNewVariable('')
    }
  }

  const removeVariable = (variable: string) => {
    setVariables(prev => prev.filter(v => v !== variable))
  }

  const extractVariablesFromContent = () => {
    const matches = formData.template_content.match(/\[([A-Z_]+)\]/g)
    if (matches) {
      const extractedVars = matches.map(match => match.slice(1, -1))
      const uniqueVars = [...new Set([...variables, ...extractedVars])]
      setVariables(uniqueVars)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in to create a template')
        return
      }

      const { error: insertError } = await supabase
        .from('communication_templates')
        .insert({
          user_id: user.id,
          name: formData.name,
          category: formData.category,
          disc_type: formData.disc_type,
          template_content: formData.template_content,
          description: formData.description,
          variables: variables
        })

      if (insertError) {
        throw insertError
      }

      router.push('/dashboard/templates')
    } catch (err: any) {
      setError(err.message || 'Failed to create template')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="flex h-16 items-center px-4 md:px-6">
          <Link href="/dashboard/templates" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Templates</span>
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Create Communication Template</CardTitle>
            <CardDescription>
              Create a reusable template optimized for specific personality types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-destructive/15 border border-destructive/20 text-destructive px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Template Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Cold Email - D Type"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="disc_type">Target Personality Type *</Label>
                <Select value={formData.disc_type} onValueChange={(value) => handleInputChange('disc_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select DISC type" />
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

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of when to use this template"
                />
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Label htmlFor="template_content">Template Content *</Label>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <HelpCircle className="h-4 w-4 mr-1" />
                    <span>Use [VARIABLE_NAME] for placeholders</span>
                  </div>
                </div>
                <Textarea
                  id="template_content"
                  value={formData.template_content}
                  onChange={(e) => handleInputChange('template_content', e.target.value)}
                  onBlur={extractVariablesFromContent}
                  placeholder={`Subject: [SUBJECT_LINE]

Hi [NAME],

[MAIN_MESSAGE]

Best regards,
[YOUR_NAME]`}
                  className="min-h-[300px] font-mono text-sm"
                  required
                />
              </div>

              <div>
                <Label>Template Variables</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Variables will be auto-detected from your template content, or add them manually
                </p>
                <div className="flex space-x-2 mb-3">
                  <Input
                    value={newVariable}
                    onChange={(e) => setNewVariable(e.target.value)}
                    placeholder="VARIABLE_NAME"
                    className="uppercase"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVariable())}
                  />
                  <Button type="button" onClick={addVariable} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {variables.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {variables.map((variable) => (
                      <div key={variable} className="flex items-center bg-gray-100 px-2 py-1 rounded text-sm">
                        <span>[{variable}]</span>
                        <button
                          type="button"
                          onClick={() => removeVariable(variable)}
                          className="ml-2 text-gray-500 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Creating Template...' : 'Create Template'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}