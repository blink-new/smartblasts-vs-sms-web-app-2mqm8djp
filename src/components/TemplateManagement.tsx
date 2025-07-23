import React, { useState, useEffect } from 'react'
import { blink } from '../blink/client'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Copy,
  MessageCircle,
  Search,
  Filter,
  Eye
} from 'lucide-react'

interface TemplateManagementProps {
  user: any
  onBack: () => void
}

interface Template {
  id: string
  userId: string
  name: string
  description: string
  category: string
  subjectLine: string
  messageTemplate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const TEMPLATE_CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'introduction', label: 'Introduction' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'meeting', label: 'Meeting Request' },
  { value: 'thank-you', label: 'Thank You' },
  { value: 'reminder', label: 'Reminder' },
  { value: 'closing', label: 'Closing' }
]

const TemplateManagement: React.FC<TemplateManagementProps> = ({ user, onBack }) => {
  console.log('TemplateManagement component rendering with user:', user)
  console.log('TemplateManagement component mounted at:', new Date().toISOString())
  
  // Add error boundary state
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [templates, setTemplates] = useState<Template[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    subjectLine: '',
    messageTemplate: ''
  })

  const loadTemplates = async () => {
    try {
      setLoading(true)
      console.log('Loading templates for user:', user)
      
      if (!user || !user.id) {
        console.error('User or user.id is missing:', user)
        setTemplates([])
        setFilteredTemplates([])
        setLoading(false)
        return
      }
      
      const templateData = await blink.db.templates.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      
      console.log('Raw template data:', templateData)
      
      const formattedTemplates = templateData.map((template: any) => ({
        id: template.id,
        userId: template.userId || template.user_id,
        name: template.name,
        description: template.description || '',
        category: template.category || 'general',
        subjectLine: template.subjectLine || template.subject_line,
        messageTemplate: template.messageTemplate || template.message_template,
        isActive: Number(template.isActive || template.is_active) > 0,
        createdAt: template.createdAt || template.created_at,
        updatedAt: template.updatedAt || template.updated_at
      }))
      
      console.log('Formatted templates:', formattedTemplates)
      setTemplates(formattedTemplates)
      setFilteredTemplates(formattedTemplates)
    } catch (error) {
      console.error('Error loading templates:', error)
      console.error('Error details:', error.message, error.stack)
      setError(`Error loading templates: ${error.message}`)
      setHasError(true)
      setTemplates([])
      setFilteredTemplates([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTemplates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let filtered = templates

    // Filter by search term
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.subjectLine.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.messageTemplate.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory)
    }

    setFilteredTemplates(filtered)
  }, [searchTerm, selectedCategory, templates])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'general',
      subjectLine: '',
      messageTemplate: ''
    })
  }

  const openCreateDialog = () => {
    resetForm()
    setShowCreateDialog(true)
  }

  const openEditDialog = (template: Template) => {
    setSelectedTemplate(template)
    setFormData({
      name: template.name,
      description: template.description,
      category: template.category,
      subjectLine: template.subjectLine,
      messageTemplate: template.messageTemplate
    })
    setShowEditDialog(true)
  }

  const openPreviewDialog = (template: Template) => {
    setSelectedTemplate(template)
    setShowPreviewDialog(true)
  }

  const saveTemplate = async () => {
    if (!formData.name.trim() || !formData.subjectLine.trim() || !formData.messageTemplate.trim()) {
      alert('Please fill in all required fields (Name, Subject Line, and Message Template)')
      return
    }

    try {
      const templateId = `template_${Date.now()}`
      await blink.db.templates.create({
        id: templateId,
        userId: user.id,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        subjectLine: formData.subjectLine,
        messageTemplate: formData.messageTemplate,
        isActive: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      setShowCreateDialog(false)
      resetForm()
      loadTemplates()
      alert('Template created successfully!')
    } catch (error) {
      console.error('Error creating template:', error)
      alert(`Error creating template: ${error.message}`)
    }
  }

  const updateTemplate = async () => {
    if (!selectedTemplate || !formData.name.trim() || !formData.subjectLine.trim() || !formData.messageTemplate.trim()) {
      alert('Please fill in all required fields (Name, Subject Line, and Message Template)')
      return
    }

    try {
      await blink.db.templates.update(selectedTemplate.id, {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        subjectLine: formData.subjectLine,
        messageTemplate: formData.messageTemplate,
        updatedAt: new Date().toISOString()
      })

      setShowEditDialog(false)
      setSelectedTemplate(null)
      resetForm()
      loadTemplates()
      alert('Template updated successfully!')
    } catch (error) {
      console.error('Error updating template:', error)
      alert(`Error updating template: ${error.message}`)
    }
  }

  const deleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      await blink.db.templates.delete(templateId)
      loadTemplates()
      alert('Template deleted successfully!')
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Error deleting template. Please try again.')
    }
  }

  const cloneTemplate = async (template: Template) => {
    try {
      const templateId = `template_${Date.now()}`
      await blink.db.templates.create({
        id: templateId,
        userId: user.id,
        name: `${template.name} (Copy)`,
        description: template.description,
        category: template.category,
        subjectLine: template.subjectLine,
        messageTemplate: template.messageTemplate,
        isActive: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      loadTemplates()
      alert('Template cloned successfully!')
    } catch (error) {
      console.error('Error cloning template:', error)
      alert(`Error cloning template: ${error.message}`)
    }
  }

  const getCategoryLabel = (category: string) => {
    const cat = TEMPLATE_CATEGORIES.find(c => c.value === category)
    return cat ? cat.label : category
  }

  const previewTemplate = (template: Template) => {
    // Sample data for preview
    const sampleData = {
      company: 'Acme Corporation',
      contact: 'John Smith',
      website: 'acmecorp.com'
    }

    const previewSubject = template.subjectLine
      .replace(/\{company\}/g, sampleData.company)
      .replace(/\{contact\}/g, sampleData.contact)
      .replace(/\{website\}/g, sampleData.website)

    const previewMessage = template.messageTemplate
      .replace(/\{company\}/g, sampleData.company)
      .replace(/\{contact\}/g, sampleData.contact)
      .replace(/\{website\}/g, sampleData.website)

    return { previewSubject, previewMessage }
  }

  // Check if user is available
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-600 mb-4">Loading User...</h2>
          <p className="text-gray-600 mb-4">Please wait while we load your user information.</p>
          <Button onClick={onBack}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  // Early error display
  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Templates</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={onBack}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={onBack} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-blue-600">SmartBlasts</h1>
              <span className="ml-3 text-gray-500">Template Management</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templates.length}</div>
              <p className="text-xs text-muted-foreground">
                {templates.filter(t => t.isActive).length} active
              </p>
            </CardContent>
          </Card>

          {TEMPLATE_CATEGORIES.slice(0, 3).map((category) => (
            <Card key={category.value}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{category.label}</CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {templates.filter(t => t.category === category.value).length}
                </div>
                <p className="text-xs text-muted-foreground">templates</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search & Filter Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search templates by name, description, subject, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {TEMPLATE_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Templates List */}
        <Card>
          <CardHeader>
            <CardTitle>Templates ({filteredTemplates.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading templates...</p>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm || selectedCategory !== 'all' ? 'No templates found' : 'No templates yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || selectedCategory !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Create your first template to get started with quick campaign creation.'
                  }
                </p>
                {!searchTerm && selectedCategory === 'all' && (
                  <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Template
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredTemplates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-6 bg-white">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{template.name}</h3>
                          <Badge variant="outline">{getCategoryLabel(template.category)}</Badge>
                          {template.isActive && <Badge variant="default">Active</Badge>}
                        </div>
                        {template.description && (
                          <p className="text-gray-600 mb-3">{template.description}</p>
                        )}
                        <div className="text-sm text-gray-500">
                          <strong>Subject:</strong> {template.subjectLine}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openPreviewDialog(template)}
                          title="Preview Template"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(template)}
                          title="Edit Template"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cloneTemplate(template)}
                          title="Clone Template"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTemplate(template.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete Template"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <div className="line-clamp-3">
                        {template.messageTemplate.substring(0, 200)}
                        {template.messageTemplate.length > 200 && '...'}
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      Created {new Date(template.createdAt).toLocaleDateString()} • 
                      Updated {new Date(template.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Template Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Introduction Email"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of this template"
              />
            </div>

            <div>
              <Label htmlFor="subjectLine">Subject Line *</Label>
              <Input
                id="subjectLine"
                value={formData.subjectLine}
                onChange={(e) => handleInputChange('subjectLine', e.target.value)}
                placeholder="e.g., Quick question about {company}'s marketing"
              />
              <div className="text-xs text-gray-500 mt-1">
                Use {'{company}'}, {'{contact}'}, {'{website}'} for personalization
              </div>
            </div>

            <div>
              <Label htmlFor="messageTemplate">Message Template *</Label>
              <Textarea
                id="messageTemplate"
                value={formData.messageTemplate}
                onChange={(e) => handleInputChange('messageTemplate', e.target.value)}
                placeholder="Hi {contact},&#10;&#10;I noticed {company} has been growing rapidly...&#10;&#10;Use {company}, {contact}, and {website} for personalization."
                rows={8}
              />
              <div className="text-xs text-gray-500 mt-1">
                Use {'{company}'}, {'{contact}'}, {'{website}'} for personalization
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={saveTemplate}>
                Create Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Template Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Introduction Email"
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of this template"
              />
            </div>

            <div>
              <Label htmlFor="edit-subjectLine">Subject Line *</Label>
              <Input
                id="edit-subjectLine"
                value={formData.subjectLine}
                onChange={(e) => handleInputChange('subjectLine', e.target.value)}
                placeholder="e.g., Quick question about {company}'s marketing"
              />
              <div className="text-xs text-gray-500 mt-1">
                Use {'{company}'}, {'{contact}'}, {'{website}'} for personalization
              </div>
            </div>

            <div>
              <Label htmlFor="edit-messageTemplate">Message Template *</Label>
              <Textarea
                id="edit-messageTemplate"
                value={formData.messageTemplate}
                onChange={(e) => handleInputChange('messageTemplate', e.target.value)}
                placeholder="Hi {contact},&#10;&#10;I noticed {company} has been growing rapidly...&#10;&#10;Use {company}, {contact}, and {website} for personalization."
                rows={8}
              />
              <div className="text-xs text-gray-500 mt-1">
                Use {'{company}'}, {'{contact}'}, {'{website}'} for personalization
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={updateTemplate}>
                Update Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Template Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold">{selectedTemplate.name}</h3>
                <Badge variant="outline">{getCategoryLabel(selectedTemplate.category)}</Badge>
              </div>
              
              {selectedTemplate.description && (
                <p className="text-gray-600">{selectedTemplate.description}</p>
              )}

              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Subject Line:</Label>
                  <div className="bg-gray-50 p-3 rounded border">
                    {previewTemplate(selectedTemplate).previewSubject}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Message:</Label>
                  <div className="bg-gray-50 p-3 rounded border whitespace-pre-wrap">
                    {previewTemplate(selectedTemplate).previewMessage}
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Preview using sample data: Acme Corporation, John Smith, acmecorp.com
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setShowPreviewDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TemplateManagement