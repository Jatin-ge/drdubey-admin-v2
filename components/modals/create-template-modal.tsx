"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Switch,
  FormControlLabel,
  TextareaAutosize,
  Typography,
  Divider,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Alert,
  AlertTitle,
  Box,
  Paper,
} from "@mui/material";
import { useModal } from "@/hooks/use-modal-store";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { ViewList, Delete, Add, Upload, Image as ImageIcon, Info, X } from "@mui/icons-material";
import { TemplateCategory } from '@prisma/client';
import { MessageSquare, Video, FileText, MapPin, AlertCircle } from "lucide-react";
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import ReactQuill from "react-quill";

enum HeaderType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  DOCUMENT = "DOCUMENT",
  LOCATION = "LOCATION",
  NONE = "NONE"
}

// Add these types at the top
type ButtonType = 
  | "QUICK_REPLY"
  | "URL"
  | "PHONE_NUMBER"
  | "COPY_CODE"
  | "CUSTOM";

interface ButtonConfig {
  type: ButtonType;
  label: string;
  maxAllowed: number;
  requiresExtra: boolean;
  extraFields?: {
    label: string;
    type: 'text' | 'url' | 'phone' | 'country' | 'code';
    placeholder?: string;
    options?: { value: string; label: string }[];
  }[];
}

const BUTTON_CONFIGS: Record<ButtonType, ButtonConfig> = {
  CUSTOM: {
    type: "CUSTOM",
    label: "Custom",
    maxAllowed: 3,
    requiresExtra: false,
    extraFields: []
  },
  QUICK_REPLY: {
    type: "QUICK_REPLY",
    label: "Quick Reply",
    maxAllowed: 3,
    requiresExtra: false,
    extraFields: []
  },
  URL: {
    type: "URL",
    label: "Visit Website",
    maxAllowed: 2,
    requiresExtra: true,
    extraFields: [
      {
        label: "URL Type",
        type: "text",
        options: [
          { value: "static", label: "Static" },
          { value: "dynamic", label: "Dynamic" }
        ]
      }
    ]
  },
  PHONE_NUMBER: {
    type: "PHONE_NUMBER",
    label: "Call Phone Number",
    maxAllowed: 1,
    requiresExtra: true,
    extraFields: [
      {
        label: "Country",
        type: "country",
        options: [
          { value: "US", label: "US +1" },
          { value: "IN", label: "IN +91" }
          // Add more countries as needed
        ]
      },
      {
        label: "Phone Number",
        type: "phone",
        placeholder: "Enter phone number"
      }
    ]
  },
  COPY_CODE: {
    type: "COPY_CODE",
    label: "Copy Offer Code",
    maxAllowed: 1,
    requiresExtra: true,
    extraFields: [
      {
        label: "Offer Code",
        type: "code",
        placeholder: "Enter offer code"
      }
    ]
  }
};

interface TemplateButton {
  type: ButtonType;
  text: string;
  url?: string;
  phoneNumber?: string;
  copyCode?: string;
  customType?: "custom" | "preconfigured";
  country?: string;
}

const formSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores allowed"),
  displayName: z.string().min(1, "Display name is required"),
  category: z.nativeEnum(TemplateCategory),
  language: z.string().min(1),
  headerType: z.string().default('NONE'),
  headerContent: z.string().optional(),
  bodyContent: z.string()
    .min(1, "Body content is required")
    .max(1024, "Body content must be less than 1024 characters"),
  footerContent: z.string()
    .max(60, "Footer must be less than 60 characters")
    .optional(),
  buttons: z.array(z.object({
    type: z.string(),
    text: z.string()
  })).optional()
});

type FormValues = z.infer<typeof formSchema>;

const categories = [
  { value: TemplateCategory.UTILITY, label: "Utility" },
  { value: TemplateCategory.MARKETING, label: "Marketing" },
  { value: TemplateCategory.AUTHENTICATION, label: "Authentication" }
];

const languages = [
  { code: "en", name: "English" },
  { code: "en_US", name: "English (US)" },
  { code: "hi", name: "Hindi" },
  { code: "ar", name: "Arabic" },
  { code: "bn", name: "Bengali" },
  { code: "gu", name: "Gujarati" },
  { code: "kn", name: "Kannada" },
  { code: "ml", name: "Malayalam" },
  { code: "mr", name: "Marathi" },
  { code: "pa", name: "Punjabi" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" }
];

const headerTypes = [
  { value: HeaderType.NONE, label: "None" },
  { value: HeaderType.TEXT, label: "Text" },
  { value: HeaderType.IMAGE, label: "Image" },
  { value: HeaderType.VIDEO, label: "Video" },
  { value: HeaderType.DOCUMENT, label: "Document" }
];

const formatTemplateName = (name: string) => {
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Add new schema for bulk creation
const bulkFormSchema = z.object({
  names: z.string().min(1, "Template names are required"),
  category: z.string().min(1, "Category is required"),
  language: z.string().min(1, "Language is required"),
});

// Add interface for props at the top
interface CreateTemplateModalProps {
  isEditing?: boolean;
  templateData?: any; // Replace 'any' with proper template type
  onClose?: () => void;
}

// Add this interface at the top with other interfaces
interface MediaUploadProps {
  type: HeaderType;
  onUpload: (url: string) => void;
}

// Add these interfaces at the top with other interfaces
interface EmojiPickerProps {
  onSelect: (emoji: { native: string }) => void;
  onClose: () => void;
}

interface ReactQuillProps {
  value: string;
  onChange: (content: string) => void;
  modules: any;
  formats: string[];
  className?: string;
  ref?: React.RefObject<ReactQuill>;
}

// Add this helper function at the top
const formatDisplayName = (name: string): string => {
  return name
    // Split by underscores, hyphens, and camelCase
    .split(/(?=[A-Z])|[-_]/)
    // Remove any special characters and extra spaces
    .map(word => word.replace(/[^a-zA-Z0-9]/g, '').trim())
    // Filter out empty strings
    .filter(word => word.length > 0)
    // Capitalize first letter of each word
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    // Join with spaces
    .join(' ');
};

// First, define the HeaderType icons and labels
type HeaderTypeKey = keyof typeof HeaderType;

const HeaderTypeConfig: Record<HeaderTypeKey, { icon: JSX.Element; label: string; description: string }> = {
  TEXT: {
    icon: <MessageSquare className="w-5 h-5" />,
    label: "Text",
    description: "Add a text header to your message"
  },
  IMAGE: {
    icon: <ImageIcon className="w-5 h-5" />,
    label: "Image",
    description: "Include an image in your header"
  },
  VIDEO: {
    icon: <Video className="w-5 h-5" />,
    label: "Video",
    description: "Add a video to your header"
  },
  DOCUMENT: {
    icon: <FileText className="w-5 h-5" />,
    label: "Document",
    description: "Attach a document in your header"
  },
  LOCATION: {
    icon: <MapPin className="w-5 h-5" />,
    label: "Location",
    description: "Share a location in your header"
  },
  NONE: {
    icon: <MessageSquare className="w-5 h-5 text-gray-400" />,
    label: "No Header",
    description: "Send message without header"
  }
};

// Add these validation functions after the HeaderTypeConfig
const validateTemplate = (values: any, buttons: TemplateButton[]) => {
  const warnings: string[] = [];

  // Check for HTML tags in body
  if (/<[^>]*>/g.test(values.bodyContent)) {
    warnings.push("⚠️ Remove HTML tags. WhatsApp templates only support plain text.");
  }

  // Count emojis in body
  const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
  const emojiCount = (values.bodyContent.match(emojiRegex) || []).length;
  if (emojiCount > 3) {
    warnings.push("⚠️ Try to use no more than 3 emojis to keep the message professional.");
  }

  // Check if message starts with emoji
  if (values.bodyContent.match(emojiRegex)?.[0] === values.bodyContent.trim()[0]) {
    warnings.push("⚠️ Avoid starting the message with an emoji. Start with clear text.");
  }

  // Check for placeholder/test content
  const placeholderWords = ['hi', 'hello guys', 'asd', 'test', 'testing', 'lorem'];
  const lowerContent = values.bodyContent.toLowerCase();
  if (placeholderWords.some(word => lowerContent.includes(word))) {
    warnings.push("⚠️ Avoid placeholder or test-like content. Use meaningful and specific messaging.");
  }

  // Check footer
  if (values.footerContent && values.footerContent.length < 3) {
    warnings.push("⚠️ Footer is too short. Add a clear call-to-action or helpful info.");
  }

  // Validate URL buttons
  buttons.forEach((button, index) => {
    if (button.type === 'URL' && button.url && !button.url.match(/^https?:\/\//)) {
      warnings.push(`⚠️ Button ${index + 1}: URL must start with 'https://' or 'http://'.`);
    }
  });

  // Check button count
  if (buttons.length > 3) {
    warnings.push("⚠️ A maximum of 3 buttons are allowed.");
  }

  // Check header content
  if (values.headerType !== 'NONE' && !values.headerContent?.trim()) {
    warnings.push("⚠️ Header content is required when using a header. Please add content.");
  }

  return warnings;
};

// Add this component after the EmojiPicker component
const ValidationWarnings = ({ warnings }: { warnings: string[] }) => {
  if (warnings.length === 0) return null;

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        mb: 3, 
        backgroundColor: '#FFF4E5',
        border: '1px solid #FFB74D',
        borderRadius: 2
      }}
    >
      <Typography variant="subtitle2" sx={{ color: '#ED6C02', fontWeight: 600, mb: 1 }}>
        Template Validation Warnings
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        {warnings.map((warning, index) => (
          <Typography 
            key={index} 
            component="li" 
            variant="body2" 
            color="text.secondary"
            sx={{ mb: 0.5 }}
          >
            {warning}
          </Typography>
        ))}
      </Box>
    </Paper>
  );
};

// Move ButtonsSection outside the main component
const ButtonsSection = ({ buttons, setButtons }: { buttons: TemplateButton[], setButtons: (buttons: TemplateButton[]) => void }) => {
  const buttonsByType = buttons.reduce((acc, button) => {
    acc[button.type] = (acc[button.type] || 0) + 1;
    return acc;
  }, {} as Record<ButtonType, number>);

  const [urlTypes, setUrlTypes] = useState<Record<number, 'static' | 'dynamic'>>({});

  const handleTextChange = (index: number, value: string) => {
    const newButtons = [...buttons];
    newButtons[index] = {
      ...newButtons[index],
      text: value
    };
    setButtons(newButtons);
  };

  const handleExtraValueChange = (index: number, value: string, type: ButtonType) => {
    const newButtons = [...buttons];
    newButtons[index] = {
      ...newButtons[index],
      [type === "URL" ? "url" :
       type === "PHONE_NUMBER" ? "phoneNumber" :
       "copyCode"]: value
    };
    setButtons(newButtons);
  };

  const handleTypeChange = (index: number, newType: ButtonType) => {
    const newButtons = [...buttons];
    newButtons[index] = {
      type: newType,
      text: "",
      url: "",
      phoneNumber: "",
      copyCode: "",
      ...(newType === "CUSTOM" && { customType: "custom" })
    };
    setButtons(newButtons);
  };

  const handleCustomTypeChange = (index: number, customType: "custom" | "preconfigured") => {
    const newButtons = [...buttons];
    newButtons[index] = {
      ...newButtons[index],
      customType,
      text: ""
    };
    setButtons(newButtons);
  };

  const addButton = () => {
    if (buttons.length < 3) {
      setButtons([...buttons, {
        type: "QUICK_REPLY",
        text: "",
        url: "",
        phoneNumber: "",
        copyCode: "",
        customType: "custom"
      }]);
    }
  };

  const removeButton = (index: number) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  const handleUrlTypeChange = (index: number, type: 'static' | 'dynamic') => {
    setUrlTypes(prev => ({ ...prev, [index]: type }));
    // Clear URL when changing type
    const newButtons = [...buttons];
    newButtons[index] = {
      ...newButtons[index],
      url: type === 'dynamic' ? '{{1}}' : ''
    };
    setButtons(newButtons);
  };

  return (
    <div className="space-y-4">
      <Typography variant="subtitle2">Buttons</Typography>
      
      {buttons.map((button, index) => (
        <div key={index} className="flex flex-col gap-2">
          <div className="flex gap-2 items-start">
            <Select
              value={button.type}
              size="small"
              sx={{ minWidth: 150 }}
              onChange={(e) => handleTypeChange(index, e.target.value as ButtonType)}
            >
              {Object.entries(BUTTON_CONFIGS).map(([type, config]) => (
                <MenuItem 
                  key={type} 
                  value={type}
                  disabled={buttonsByType[type as ButtonType] >= config.maxAllowed}
                >
                  {config.label} ({buttonsByType[type as ButtonType] || 0}/{config.maxAllowed})
                </MenuItem>
              ))}
            </Select>
            
            <TextField
              fullWidth
              label="Button Text"
              value={button.text || ""}
              onChange={(e) => handleTextChange(index, e.target.value)}
              size="small"
              sx={{ flex: 1 }}
            />
            
            <IconButton onClick={() => removeButton(index)} size="small">
              <Delete />
            </IconButton>
          </div>

          {button.type === "URL" && (
            <div className="ml-4">
              <FormControl fullWidth size="small">
                <InputLabel>URL Type</InputLabel>
                <Select
                  value={urlTypes[index] || 'static'}
                  onChange={(e) => handleUrlTypeChange(index, e.target.value as 'static' | 'dynamic')}
                  label="URL Type"
                >
                  <MenuItem value="static">Static URL</MenuItem>
                  <MenuItem value="dynamic">Dynamic URL</MenuItem>
                </Select>
              </FormControl>

              {urlTypes[index] === 'static' ? (
                <TextField
                  fullWidth
                  size="small"
                  label="Website URL"
                  placeholder="https://www.example.com"
                  value={button.url || ''}
                  onChange={(e) => handleExtraValueChange(index, e.target.value, 'URL')}
                  sx={{ mt: 2 }}
                />
              ) : (
                <TextField
                  disabled
                  fullWidth
                  size="small"
                  value="Dynamic URL will use {{1}} parameter"
                  sx={{ mt: 2 }}
                />
              )}
            </div>
          )}
        </div>
      ))}
      
      <Button 
        onClick={addButton} 
        startIcon={<Add />}
        disabled={buttons.length >= 3}
        size="small"
      >
        Add Button
      </Button>
    </div>
  );
};

// Add the EmojiPicker component
const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
  return (
    <div className="absolute z-50 bottom-full mb-2">
      <div className="relative">
        <button 
          onClick={onClose}
          className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </button>
        <Picker 
          data={data} 
          onEmojiSelect={(emoji: any) => {
            onSelect(emoji);
            onClose();
          }}
        />
      </div>
    </div>
  );
};

// Dynamic import of ReactQuill with proper typing
const DynamicQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill');
    return function CustomQuill({ forwardedRef, ...props }: any) {
      return <RQ ref={forwardedRef} {...props} />;
    };
  },
  {
    ssr: false,
    loading: () => <div className="h-[200px] w-full bg-gray-100 rounded-lg animate-pulse" />
  }
);

// Update the RichTextEditor component
const RichTextEditor = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const quillRef = useRef<any>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleClickOutside = (event: MouseEvent) => {
        if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
          setShowEmojiPicker(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, []);

  const handleEmojiSelect = (emoji: { native: string }) => {
    const editor = quillRef.current?.getEditor();
    if (editor) {
      const range = editor.getSelection();
      if (range) {
        editor.insertText(range.index, emoji.native);
        editor.setSelection({ index: range.index + emoji.native.length, length: 0 });
      } else {
        editor.insertText(editor.getLength() - 1, emoji.native);
        editor.setSelection({ index: editor.getLength() - 1, length: 0 });
      }
    }
    setShowEmojiPicker(false);
  };

  return (
    <div className="relative">
      <DynamicQuill
        forwardedRef={quillRef}
        value={value}
        onChange={onChange}
        modules={{
          toolbar: false // Disable formatting toolbar
        }}
        formats={[]} // Disable all formats
        placeholder="Enter your message here..."
        className="bg-white rounded-lg"
      />
      
      <div className="absolute bottom-2 right-2 z-10" ref={emojiPickerRef}>
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          😊
        </button>
        
        {showEmojiPicker && (
          <div className="absolute bottom-full right-0 mb-2">
            <div className="relative bg-white rounded-lg shadow-lg">
              <button
                onClick={() => setShowEmojiPicker(false)}
                className="absolute right-2 top-2 z-10 p-1 hover:bg-gray-100 rounded text-gray-500"
              >
                ✕
              </button>
              <Picker
                data={data}
                onEmojiSelect={handleEmojiSelect}
                theme="light"
                previewPosition="none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Update the cleanPreviewText function to handle undefined values
const cleanPreviewText = (text: string | undefined): string => {
  if (!text) return "";
  return text
    .replace(/<p>/g, '')
    .replace(/<\/p>/g, '\n')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
};

// Add template guidelines
const templateGuidelines = [
  "• Use clear, specific language",
  "• Avoid excessive emojis (max 3)",
  "• Keep proper spacing between paragraphs",
  "• Include specific dates in format: DD Month YYYY (e.g., 18 May 2024)",
  "• Include location details in proper format",
  "• Avoid promotional language",
  "• Don't use all caps",
  "• Don't use excessive punctuation",
  "• Keep proper line breaks between sections",
  "• Ensure time format is consistent: HH:MM AM/PM"
];

// Update the component to accept props
export const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({
  isEditing = false,
  templateData,
  onClose: propOnClose,
}) => {
  const { isOpen, onClose: modalOnClose, type, onOpen } = useModal();
  const isModalOpen = isOpen && (type === "createTemplate" || type === "editTemplate");
  const [isLoading, setIsLoading] = useState(false);
  const [previewName, setPreviewName] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkPreview, setBulkPreview] = useState<Array<{ name: string, formatted: string }>>([]);
  const [buttons, setButtons] = useState<TemplateButton[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  // Use prop onClose if provided, otherwise use modal onClose
  const handleClose = () => {
    if (propOnClose) {
      propOnClose();
    } else {
      modalOnClose();
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      displayName: "",
      category: TemplateCategory.MARKETING,
      language: "en_US",
      headerType: HeaderType.NONE,
      headerContent: "",
      bodyContent: "",
      footerContent: "",
      buttons: []
    }
  });

  const bulkForm = useForm({
    resolver: zodResolver(bulkFormSchema),
    defaultValues: {
      names: "",
      category: "",
      language: "",
    },
  });

  const handleBulkPreview = (namesText: string) => {
    const names = namesText.split('\n').filter(name => name.trim());
    const preview = names.map(name => ({
      name: name.trim(),
      formatted: formatTemplateName(name.trim())
    }));
    setBulkPreview(preview);
  };

  const onBulkSubmit = async (values: z.infer<typeof bulkFormSchema>) => {
    try {
      setIsLoading(true);
      const names = values.names.split('\n').filter(name => name.trim());
      
      const templates = names.map(name => ({
        name: name.trim(),
        displayName: name.trim(),
        category: values.category,
        language: values.language,
      }));

      const response = await axios.post("/api/templates/bulk", { templates });
      
      if (response.data.skipped.length > 0) {
        toast.error(
          <div>
            <p>The following templates already exist:</p>
            <ul className="mt-2 list-disc pl-4">
              {response.data.skipped.map((name: string) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>,
          {
            duration: 5000, // Show for longer since there's more to read
            style: {
              maxWidth: '500px'
            }
          }
        );
      }
      
      if (response.data.created > 0) {
        toast.success(`Successfully created ${response.data.created} templates`);
      }

      if (response.data.created === 0 && response.data.skipped.length > 0) {
        toast.error("No new templates were created - all already exist");
      }

      bulkForm.reset();
      handleClose();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || 
        "Failed to create templates. Please try again."
      );
    } finally {
      
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      // Preserve line breaks while cleaning HTML
      const cleanBodyContent = values.bodyContent
        .replace(/<p>/g, '') // Remove opening p tags
        .replace(/<\/p>/g, '\n') // Replace closing p tags with newline
        .replace(/<br\s*\/?>/g, '\n') // Replace br tags with newline
        .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
        .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
        .replace(/\n\s*\n\s*\n/g, '\n\n') // Replace triple+ newlines with double
        .trim(); // Trim extra whitespace
      
      const data = {
        ...values,
        bodyContent: cleanBodyContent,
        buttons: buttons.map(button => ({
          type: button.type,
          text: button.text,
          url: button.type === "URL" ? button.url : undefined
        }))
      };

      if (isEditing) {
        await axios.patch(`/api/templates/${templateData.id}`, data);
        toast.success("Template updated successfully");
      } else {
        await axios.post("/api/templates", data);
        toast.success("Template created successfully");
      }
      
      handleClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to save template");
    } finally {
      setIsLoading(false);
    }
  };

  // Add effect to validate form
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      // Only validate when specific fields change
      if (['bodyContent', 'headerType', 'headerContent', 'footerContent'].includes(name || '')) {
        const values = form.getValues();
        const warnings = validateTemplate(values, buttons);
        setValidationWarnings(warnings);
      }

      // Handle template name formatting
      if (name === 'name') {
        const templateName = value.name as string;
    if (templateName) {
          const formattedName = formatDisplayName(templateName);
          form.setValue('displayName', formattedName, { shouldValidate: false });
          setPreviewName(formattedName);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form, buttons]);

  // Update the helper text components
  const HeaderHelp = () => (
    <Typography variant="caption" color="textSecondary">
      <div className="space-y-1">
        <div>• Text: Up to 60 characters</div>
        <div>• Media: Supports image, video, document</div>
        <div>• Variables: Use {'{{'} 1 {'}},'} {'{{'} 2 {'}}'} etc.</div>
      </div>
    </Typography>
  );

  const BodyHelp = () => (
    <Typography variant="caption" color="textSecondary">
      <div className="space-y-1">
        <div>• Required</div>
        <div>• Up to 1024 characters</div>
        <div>• Variables: Use {'{{'} 1 {'}},'} {'{{'} 2 {'}}'} etc.</div>
        <div>• Format: Bold (*text*), Italic (_text_), Strike-through (~text~)</div>
        <div className="mt-2 text-orange-600">Template Guidelines:</div>
        <div>• Be specific and clear about your service</div>
        <div>• Avoid generic promotional language</div>
        <div>• Use UTILITY category for better approval chances</div>
        <div>• Examples:</div>
        <div className="pl-2 text-green-600">✓ "Your appointment with Dr. {'{{'} 1 {'}}'}  is confirmed for {'{{'} 2 {'}}'}"</div>
        <div className="pl-2 text-green-600">✓ "Your order #{'{{'} 1 {'}}'}  has shipped and will arrive by {'{{'} 2 {'}}'}"</div>
        <div className="pl-2 text-red-600">✗ "Welcome! Check out our website"</div>
        <div className="pl-2 text-red-600">✗ "Don't miss our latest updates"</div>
      </div>
    </Typography>
  );

  // Add a warning for marketing templates
  const CategoryHelp = () => (
    <Typography variant="caption" color="textSecondary">
      <div className="space-y-1">
        <div>• UTILITY: For transactional messages (recommended)</div>
        <div>• MARKETING: Strict approval process, avoid promotional language</div>
        <div>• AUTHENTICATION: For OTP and verification codes only</div>
      </div>
    </Typography>
  );

  // Update the MediaUpload component to upload directly to Meta
  const MediaUpload = ({ type, onUpload }: { type: string; onUpload: (url: string) => void }) => {
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (file: File) => {
      try {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        const response = await axios.post('/api/templates/media', formData);
        console.log("Media upload response:", response.data);
        
        if (response.data.id) {
          onUpload(response.data.id);
          toast.success('Media uploaded successfully');
        } else {
          throw new Error('No media ID received');
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload media');
      } finally {
        setIsUploading(false);
      }
    };

    return (
      <div className="mt-2">
        <label className="flex items-center gap-2 cursor-pointer p-2 border rounded hover:bg-gray-50">
          <Upload className="h-5 w-5" />
          <span>{isUploading ? 'Uploading...' : `Upload ${type}`}</span>
          <input
            type="file"
            className="hidden"
            accept={type === 'IMAGE' ? 'image/*' : 
                   type === 'VIDEO' ? 'video/*' : 
                   type === 'DOCUMENT' ? '.pdf,.doc,.docx' : '*/*'}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
            disabled={isUploading}
          />
        </label>
      </div>
    );
  };

  return (
    <Dialog 
      open={isModalOpen} 
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogContent>
        <div className="grid grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="space-y-6">
            <DialogTitle>
              <Typography variant="h5" component="h2">
                Create Message Template
              </Typography>
            </DialogTitle>

            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                mb: 3, 
                backgroundColor: '#fff8e1',
                border: '1px solid #ffd54f',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2
              }}
            >
              <Info sx={{ color: '#f57c00', mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#f57c00', fontWeight: 600, mb: 0.5 }}>
                  Important Note:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Currently, only text-based templates are fully supported. Please select "TEXT" as the header type for now. 
                  Support for media headers (image, video, document) will be added in future updates.
                </Typography>
              </Box>
            </Paper>
            
            {validationWarnings.length > 0 && (
              <ValidationWarnings warnings={validationWarnings} />
            )}
            
            <div className="flex justify-between items-center mb-4">
             
              <Button
                variant="outlined"
                onClick={() => onOpen("viewTemplates")}
                startIcon={<ViewList />}
              >
                View Templates
              </Button>
            </div>

            {isBulkMode ? (
              <form onSubmit={bulkForm.handleSubmit(onBulkSubmit)} className="space-y-6">
                <TextareaAutosize
                  minRows={5}
                  placeholder="Enter template names (one per line)
Example:
opd_follow_up_1
opd_follow_up_2
reminder_appointment_1"
                  className="w-full p-3 border rounded-lg"
                  {...bulkForm.register("names")}
                  onChange={(e) => {
                    bulkForm.setValue("names", e.target.value);
                    handleBulkPreview(e.target.value);
                  }}
                />

                {bulkPreview.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Preview:</Typography>
                    {bulkPreview.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{item.name}</span>
                        <span className="text-primary">→</span>
                        <span className="font-medium">{item.formatted}</span>
                      </div>
                    ))}
                  </div>
                )}

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={form.watch("category") || TemplateCategory.UTILITY}
                    onChange={(e) => form.setValue("category", e.target.value as TemplateCategory)}
                    label="Category"
                    error={!!form.formState.errors.category}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.value} value={category.value}>
                        {category.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <CategoryHelp />
                </FormControl>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={form.watch("language") || "en_US"}
                    onChange={(e) => form.setValue("language", e.target.value)}
                    label="Language"
                    error={!!form.formState.errors.language}
                  >
                    {languages.map((lang) => (
                      <MenuItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  {isLoading ? 'Creating...' : 'Create Templates'}
                </Button>
              </form>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <TextField
                  fullWidth
                  label="Template Name/ID"
                  disabled={isLoading}
                  {...form.register("name")}
                  error={!!form.formState.errors.name}
                  helperText={
                    form.formState.errors.name?.message || 
                    (previewName && `Will be displayed as: ${previewName}`)
                  }
                  sx={{ 
                    mb: 3,
                    '& .MuiFormHelperText-root': {
                      color: previewName ? 'success.main' : 'error.main'
                    },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                />

                <TextField
                  fullWidth
                  label="Display Name"
                  disabled={isLoading}
                  {...form.register("displayName")}
                  error={!!form.formState.errors.displayName}
                  helperText={form.formState.errors.displayName?.message}
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    },
                    '& .MuiInputLabel-root': {
                      backgroundColor: 'white',
                      px: 1,
                    },
                    '& .MuiInputLabel-shrink': {
                      backgroundColor: 'white',
                      px: 1,
                    }
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={form.watch("category") || TemplateCategory.UTILITY}
                    onChange={(e) => form.setValue("category", e.target.value as TemplateCategory)}
                    label="Category"
                    error={!!form.formState.errors.category}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.value} value={category.value}>
                        {category.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <CategoryHelp />
                </FormControl>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={form.watch("language") || "en_US"}
                    onChange={(e) => form.setValue("language", e.target.value)}
                    label="Language"
                    error={!!form.formState.errors.language}
                  >
                    {languages.map((lang) => (
                      <MenuItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>
                    Header Type
                    <span className="text-gray-400 text-sm ml-1">(Optional)</span>
                  </InputLabel>
                  <Select
                    value={form.watch("headerType") || HeaderType.NONE}
                    onChange={(e) => form.setValue("headerType", e.target.value as HeaderType)}
                    label="Header Type"
                  >
                    {Object.entries(HeaderType).map(([key, value]) => (
                      <MenuItem key={key} value={value}>
                        <div className="flex items-center gap-3">
                          <div className="text-gray-500">
                            {HeaderTypeConfig[key as HeaderTypeKey].icon}
                          </div>
                          <div>
                            <div className="font-medium">
                              {HeaderTypeConfig[key as HeaderTypeKey].label}
                            </div>
                            <div className="text-xs text-gray-500">
                              {HeaderTypeConfig[key as HeaderTypeKey].description}
                            </div>
                          </div>
                        </div>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {form.watch("headerType") !== HeaderType.NONE && (
                  <TextField
                    fullWidth
                    label={
                      <div className="flex items-center gap-2">
                        {HeaderTypeConfig[form.watch("headerType") as HeaderTypeKey].icon}
                        <span>Header Content</span>
                        <span className="text-gray-400 text-sm">(Optional)</span>
                      </div>
                    }
                    {...form.register("headerContent")}
                    multiline={form.watch("headerType") === HeaderType.TEXT}
                    rows={form.watch("headerType") === HeaderType.TEXT ? 3 : 1}
                  />
                )}

                {/* Body Content with Rich Text Editor */}
                <div className="mb-4">
                  <Typography variant="subtitle2" gutterBottom>
                    Body Content
                  </Typography>
                  <RichTextEditor
                    value={form.watch("bodyContent")}
                    onChange={(content) => form.setValue("bodyContent", content)}
                  />
                  {form.formState.errors.bodyContent && (
                    <Typography color="error" variant="caption">
                      {form.formState.errors.bodyContent.message}
                    </Typography>
                  )}
                </div>

                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Footer Content"
                  {...form.register("footerContent")}
                  error={!!form.formState.errors.footerContent}
                  helperText="Optional, up to 60 characters"
                  sx={{ mb: 3 }}
                />

                <ButtonsSection buttons={buttons} setButtons={setButtons} />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  fullWidth
                  sx={{
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 500,
                    backgroundColor: theme => theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme => theme.palette.primary.dark,
                    }
                  }}
                >
                  {isLoading ? 'Creating...' : 'Create Template'}
                </Button>
              </form>
            )}
          </div>

          {/* Preview Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="bg-[#E5F6FD] p-4 rounded-lg mb-4">
              <Typography variant="subtitle2" className="flex items-center gap-2 mb-3">
                <AlertCircle className="text-blue-500" />
                Template Preview
              </Typography>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                {/* Template Name */}
                <div className="text-sm text-gray-500 mb-2">
                  Template Name: <span className="font-medium text-black">{form.watch("name")}</span>
                </div>

                {/* Header Preview */}
                {form.watch("headerType") !== HeaderType.NONE && (
                  <div className="border-b pb-3 mb-3">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      {HeaderTypeConfig[form.watch("headerType") as HeaderTypeKey].icon}
                      <span className="text-sm font-medium">Header</span>
                    </div>
                    <div className="text-sm pl-7 whitespace-pre-line">
                      {cleanPreviewText(form.watch("headerContent"))}
                    </div>
                  </div>
                )}

                {/* Body Preview */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm font-medium">Body</span>
                  </div>
                  <div className="text-sm pl-7 whitespace-pre-line">
                    {cleanPreviewText(form.watch("bodyContent"))}
                  </div>
                </div>

                {/* Footer Preview */}
                {form.watch("footerContent") && (
                  <div className="text-xs text-gray-500 pl-7 pt-2 border-t whitespace-pre-line">
                    {cleanPreviewText(form.watch("footerContent"))}
                  </div>
                )}
              </div>
            </div>

            {/* Template Guidelines */}
            <div className="mt-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <Typography variant="subtitle2" className="flex items-center gap-2 mb-2 text-yellow-800">
                <AlertCircle className="text-yellow-600" />
                WhatsApp Template Guidelines
              </Typography>
              <div className="space-y-1">
                {templateGuidelines.map((guideline, index) => (
                  <Typography key={index} variant="body2" className="text-yellow-800 text-sm">
                    {guideline}
                  </Typography>
                ))}
              </div>
            </div>

            {/* Button Preview */}
            {buttons.length > 0 && (
              <div className="mt-3 space-y-2">
                <Typography variant="subtitle2">Buttons:</Typography>
                <div className="flex flex-col gap-2">
                  {buttons.map((button, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{button.text}</span>
                      {button.type === 'URL' && button.url && (
                        <span className="text-gray-500">({button.url})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 