import React, { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { 
  Plus, 
  Trash2, 
  Edit3,
  Save,
  X
} from 'lucide-react'

interface CustomField {
  id: string
  name: string
  label: string
  type: 'text' | 'email' | 'url' | 'phone' | 'number'
  required: boolean
}

interface CustomFieldManagerProps {
  fields: CustomField[]
  onFieldsChange: (fields: CustomField[]) => void
}

const CustomFieldManager: React.FC<CustomFieldManagerProps> = ({ fields, onFieldsChange }) => {
  const [editingField, setEditingField] = useState<string | null>(null)
  const [newField, setNewField] = useState({
    name: '',
    label: '',
    type: 'text' as const,
    required: false
  })
  const [showAddForm, setShowAddForm] = useState(false)

  const addField = () => {
    if (!newField.name || !newField.label) {
      alert('Please enter both field name and label')
      return
    }

    const fieldId = `field_${Date.now()}`
    const updatedFields = [...fields, {
      id: fieldId,
      name: newField.name.toLowerCase().replace(/\s+/g, '_'),
      label: newField.label,
      type: newField.type,
      required: newField.required
    }]

    onFieldsChange(updatedFields)
    setNewField({ name: '', label: '', type: 'text', required: false })
    setShowAddForm(false)
  }

  const removeField = (fieldId: string) => {
    const updatedFields = fields.filter(field => field.id !== fieldId)
    onFieldsChange(updatedFields)
  }

  const updateField = (fieldId: string, updates: Partial<CustomField>) => {
    const updatedFields = fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    )
    onFieldsChange(updatedFields)
    setEditingField(null)
  }

  const getFieldTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-800'
      case 'url': return 'bg-green-100 text-green-800'
      case 'phone': return 'bg-purple-100 text-purple-800'
      case 'number': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Custom Fields</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Field Form */}
        {showAddForm && (
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="font-semibold mb-3">Add New Field</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fieldName">Field Name</Label>
                <Input
                  id="fieldName"
                  value={newField.name}
                  onChange={(e) => setNewField(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Company Size"
                />
              </div>
              <div>
                <Label htmlFor="fieldLabel">Display Label</Label>
                <Input
                  id="fieldLabel"
                  value={newField.label}
                  onChange={(e) => setNewField(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="e.g., Company Size"
                />
              </div>
              <div>
                <Label htmlFor="fieldType">Field Type</Label>
                <select
                  id="fieldType"
                  value={newField.type}
                  onChange={(e) => setNewField(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="url">URL</option>
                  <option value="phone">Phone</option>
                  <option value="number">Number</option>
                </select>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="fieldRequired"
                  checked={newField.required}
                  onChange={(e) => setNewField(prev => ({ ...prev, required: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="fieldRequired">Required Field</Label>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddForm(false)
                  setNewField({ name: '', label: '', type: 'text', required: false })
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={addField}>
                <Save className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </div>
          </div>
        )}

        {/* Existing Fields */}
        <div className="space-y-3">
          {fields.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No custom fields defined yet.</p>
              <p className="text-sm">Add custom fields to capture additional contact information.</p>
            </div>
          ) : (
            fields.map((field) => (
              <div key={field.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                {editingField === field.id ? (
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <Input
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      placeholder="Display Label"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => updateField(field.id, { type: e.target.value as any })}
                      className="p-2 border border-gray-300 rounded-md"
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="url">URL</option>
                      <option value="phone">Phone</option>
                      <option value="number">Number</option>
                    </select>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Required</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">{field.label}</span>
                      <Badge className={getFieldTypeColor(field.type)}>
                        {field.type}
                      </Badge>
                      {field.required && (
                        <Badge variant="outline" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Field name: {field.name}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-1">
                  {editingField === field.id ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingField(null)}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingField(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingField(field.id)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeField(field.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Default Fields Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Default Fields</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>The following fields are always available:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge className="bg-blue-100 text-blue-800">Company Name</Badge>
              <Badge className="bg-blue-100 text-blue-800">Contact Name</Badge>
              <Badge className="bg-blue-100 text-blue-800">Email</Badge>
              <Badge className="bg-blue-100 text-blue-800">Website</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CustomFieldManager