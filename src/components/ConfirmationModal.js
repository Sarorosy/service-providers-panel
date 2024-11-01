// ConfirmationModal.js
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleX, TriangleAlert } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, content, isReversible="" }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                    <motion.div
                        className="bg-white p-6 rounded-lg shadow-lg border border-red-600"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.8 }}
                    >
                        <h2 className="text-lg mb-4 font-semibold">
                            <span className="text-2xl font-bold">
                                <CircleX className="inline text-red-600 mr-2" />
                                Are you sure?
                            </span>
                            <span className="block text-gray-700">{content}</span>
                        </h2>
                        {isReversible && (
                            <p className="bg-red-100 p-2 rounded flex my-2">
                                <TriangleAlert className="mr-2 text-red-600 font-semibold" />
                                This is an irreversible process
                            </p>
                        )}

                        <div className="flex justify-end">
                            <button
                                onClick={onClose}
                                className="bg-gray-300 text-gray-800 py-2 px-4 rounded mr-2 transition duration-200 hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className="bg-red-600 text-white py-2 px-4 rounded transition duration-200 hover:bg-red-700"
                            >
                                Yes
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmationModal;
