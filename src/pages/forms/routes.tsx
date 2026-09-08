import { lazyPage } from "@/lib/lazyPage";
import type { RouteObject } from "react-router-dom";
import { paths } from "@/router/paths";
const FormElementsPage = lazyPage(() => import("./FormElementsPage"), "FormElementsPage");
const FormLayoutsPage = lazyPage(() => import("./FormLayoutsPage"), "FormLayoutsPage");
const FormValidationPage = lazyPage(() => import("./FormValidationPage"), "FormValidationPage");
const MultiStepWizardPage = lazyPage(() => import("./MultiStepWizardPage"), "MultiStepWizardPage");
const FileUploadPage = lazyPage(() => import("./FileUploadPage"), "FileUploadPage");
const RichTextEditorPage = lazyPage(() => import("./RichTextEditorPage"), "RichTextEditorPage");
const DatePickersPage = lazyPage(() => import("./DatePickersPage"), "DatePickersPage");
const SelectComponentsPage = lazyPage(() => import("./SelectComponentsPage"), "SelectComponentsPage");
const InputMasksPage = lazyPage(() => import("./InputMasksPage"), "InputMasksPage");

export const formsRoutes: RouteObject[] = [
  { path: paths.forms.elements, element: <FormElementsPage /> },
  { path: paths.forms.layouts, element: <FormLayoutsPage /> },
  { path: paths.forms.validation, element: <FormValidationPage /> },
  { path: paths.forms.wizard, element: <MultiStepWizardPage /> },
  { path: paths.forms.fileUpload, element: <FileUploadPage /> },
  { path: paths.forms.richText, element: <RichTextEditorPage /> },
  { path: paths.forms.datePickers, element: <DatePickersPage /> },
  { path: paths.forms.select, element: <SelectComponentsPage /> },
  { path: paths.forms.inputMasks, element: <InputMasksPage /> },
];
