import { Field } from "@/types/fields";
import { useEffect, useState } from "react";
import { FiArrowLeft, FiEdit2, FiSave, FiTrash2, FiUser } from "react-icons/fi";
import { getErrorMessage } from "@/lib/error-message";
import { getImageUrl, uploadImage } from "@/services/upload.service";
import { toast } from "sonner";
import ConfirmDialog from "./ConfirmDialog";
import RoundedSelect from "./RoundedSelect";

interface Props {
  title: string;
  entity: any;
  fields: Field[];
  onBack: () => void;
  onSave: (data: any) => Promise<void>;
  onDelete: () => Promise<void>;
  extraSection?: (
    editing: boolean,
    formData: any,
    setFormData: React.Dispatch<any>,
  ) => React.ReactNode;
}

export default function DetailsDashboard({
  title,
  entity,
  fields,
  onBack,
  onSave,
  onDelete,
  extraSection,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    if (entity) {
      setFormData(entity);
    }
  }, [entity]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const save = async () => {
    try {
      setLoading(true);
      await onSave(formData);
      setEditing(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={onBack}
            aria-label="Back"
            className="flex items-center gap-2 text-white rounded-lg border mb-3 px-4 py-3 bg-gradient-to-r from-indigo-900 to-blue-500"
          >
            <FiArrowLeft aria-hidden="true"/>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        </div>
        <span
          className={`px-10 py-5 rounded-full font-medium ${
            entity.active
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {entity.active ? "Active" : "Inactive"}
        </span>
        <div className="flex gap-3">
          <button
            onClick={() => setEditing(!editing)}
            aria-label={`${editing ? "Cancel" : "Edit"}`}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg transition text-right
              ${
                editing
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-gradient-to-r from-indigo-900 to-blue-500 text-white hover:bg-blue-700"
              }`}
          >
            <FiEdit2 aria-hidden="true"/>
            {editing ? "Cancel" : "Edit"}
          </button>
          {editing && (
            <button
              onClick={save}
              disabled={loading}
              aria-label={`${loading ? "Saving..." : "Save"}`}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-900 to-green-500 text-white disabled:opacity-50 transition"
            >
              <FiSave aria-hidden="true"/>

              {loading ? "Saving..." : "Save"}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-7">
        <div className="flex items-center gap-2 mb-6">
          <FiUser className="text-blue-600" />
          <h2 className="text-lg font-semibold">General Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field) => (
            <div
              key={field.name}
              className={field.type === "textarea" ? "md:col-span-2" : ""}
            >
              <label className="block mb-2 text-sm font-medium text-gray-700">
                {field.label}
              </label>

              {field.type === "image" ? (
                <div className="space-y-4">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-blue-100 shadow-sm">
                    {formData[field.name] ? (
                      <img
                        src={getImageUrl(formData[field.name])}
                        alt={field.label}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FiUser size={40} className="text-blue-600" />
                    )}
                  </div>

                  {editing && !field.readOnly && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        try {
                          const url = await uploadImage(file, "profile");
                          setFormData((prev: any) => ({
                            ...prev,
                            [field.name]: url,
                          }));
                        } catch (error) {
                          toast.error(
                            getErrorMessage(error, "Image upload failed."),
                          );
                        }
                      }}
                    />
                  )}
                </div>
              ) : field.type === "textarea" ? (
                <textarea
                  rows={5}
                  name={field.name}
                  value={formData[field.name] ?? ""}
                  onChange={handleChange}
                  disabled={!editing || field.readOnly}
                  className={`w-full rounded-lg border px-4 py-3 transition ${
                    editing && !field.readOnly
                      ? "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      : "bg-gray-50 border-gray-200 text-gray-600"
                  }`}
                />
              ) : field.type === "select" ? (
                <RoundedSelect
                  value={formData[field.name] ?? ""}
                  placeholder={`Select ${field.label}`}
                  options={field.options ?? []}
                  disabled={!editing || field.readOnly}
                  onChange={(value) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      [field.name]: value,
                    }))
                  }
                />
              ) : (
                <input
                  type={field.type ?? "text"}
                  name={field.name}
                  value={formData[field.name] ?? ""}
                  onChange={handleChange}
                  disabled={!editing || field.readOnly}
                  className={`w-full rounded-lg border px-4 py-2.5 transition ${
                    editing && !field.readOnly
                      ? "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      : "bg-gray-50 border-gray-200 text-gray-600"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      {extraSection?.(editing, formData, setFormData)}
      <div className="p-6">
        <div className="flex justify-end gap-3 pt-6">
          <button
            onClick={() => setConfirmDelete(true)}
            aria-label="Delete"
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-white bg-gradient-to-r from-red-900 to-red-500 transition"
          >
            <FiTrash2 aria-hidden="true"/>
            Delete
          </button>
        </div>
      </div>
      <ConfirmDialog
        open={confirmDelete}
        title={`Delete ${title}`}
        description="This action cannot be undone."
        variant="danger"
        loading={loadingDelete}
        confirmLabel="Delete"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          await onDelete();
          setConfirmDelete(false);
        }}
      />
    </div>
  );
}
