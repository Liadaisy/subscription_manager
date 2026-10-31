import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import Modal from '../common/Modal';
import { Layers, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function PlanModal({ isOpen, onClose, editingPlan = null }) {
  const { addPlan, updatePlan } = useData();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(79);
  const [yearlyPrice, setYearlyPrice] = useState(790);
  const [features, setFeatures] = useState([
    'Up to 10 Team Members',
    '100 GB Cloud Storage',
    'Standard Invoicing & Reports'
  ]);
  const [newFeatureText, setNewFeatureText] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (editingPlan) {
      setName(editingPlan.name);
      setDescription(editingPlan.description || '');
      setPrice(editingPlan.price);
      setYearlyPrice(editingPlan.yearlyPrice || editingPlan.price * 10);
      setFeatures(editingPlan.features || []);
    } else {
      setName('');
      setDescription('');
      setPrice(79);
      setYearlyPrice(790);
      setFeatures(['Up to 10 Team Members', '100 GB Cloud Storage', 'Full API Access']);
    }
    setSuccess(false);
  }, [isOpen, editingPlan]);

  const addFeature = () => {
    if (!newFeatureText.trim()) return;
    setFeatures([...features, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  const removeFeature = (idx) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingPlan) {
      updatePlan(editingPlan.id, {
        name,
        description,
        price: Number(price),
        yearlyPrice: Number(yearlyPrice),
        features
      });
    } else {
      addPlan({
        name,
        description,
        price: Number(price),
        yearlyPrice: Number(yearlyPrice),
        features,
        code: name.toLowerCase().replace(/\s+/g, '-'),
        popular: false
      });
    }

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingPlan ? `Edit Plan – ${editingPlan.name}` : 'Create Subscription Plan'}
      subtitle="Define pricing tier, billing interval, and bundled features"
      maxWidth="max-w-lg"
    >
      {success ? (
        <div className="py-8 text-center">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-navy-900 mb-1">
            {editingPlan ? 'Plan Updated Successfully!' : 'Plan Created Successfully!'}
          </h4>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Plan Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Growth Accelerator, Team Plus"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short summary of this tier's ideal customer"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Monthly Price ($) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  setYearlyPrice(e.target.value * 10);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Annual Price ($)
              </label>
              <input
                type="number"
                min="0"
                value={yearlyPrice}
                onChange={(e) => setYearlyPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
                required
              />
            </div>
          </div>

          {/* Features list */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Included Features
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newFeatureText}
                onChange={(e) => setNewFeatureText(e.target.value)}
                placeholder="Add feature item..."
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addFeature();
                  }
                }}
              />
              <button
                type="button"
                onClick={addFeature}
                className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-700"
              >
                Add
              </button>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {features.map((feat, idx) => (
                <div key={idx} className="flex items-center justify-between px-3 py-1.5 bg-slate-50 rounded-lg text-xs border border-slate-200">
                  <span className="text-slate-700 truncate">{feat}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(idx)}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{editingPlan ? 'Save Changes' : 'Create Plan'}</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
