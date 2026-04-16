"use client";

import { useState } from "react";
import { Modal } from "../Modal";

type ModalType = "delete" | "createNote" | "createStack" | null;

type ModalContext = {
    notebookId?: number;
    notebookName?: string;
};

const initialContext: ModalContext = {};

export default function NotebooksPanelExample() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<ModalType>(null);
    const [modalContext, setModalContext] = useState<ModalContext>(initialContext);

    function openModal(type: Exclude<ModalType, null>, context: ModalContext = initialContext) {
        setModalType(type);
        setModalContext(context);
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
        setModalType(null);
        setModalContext(initialContext);
    }

    function renderModalContent() {
        switch (modalType) {
            case "delete":
                return (
                    <>
                        <h2 className="text-lg font-semibold">Delete Notebook</h2>
                        <p className="mt-2 text-sm text-gray-300">
                            Are you sure you want to delete{" "}
                            <span className="font-medium text-white">{modalContext.notebookName}</span>?
                        </p>
                        <div className="mt-4 flex justify-end gap-2">
                            <button className="rounded border border-gray-600 px-3 py-2 text-sm" onClick={closeModal}>
                                Cancel
                            </button>
                            <button
                                className="rounded bg-red-600 px-3 py-2 text-sm text-white"
                                onClick={() => {
                                    // Example: call delete API here with modalContext.notebookId
                                    closeModal();
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </>
                );
            case "createNote":
                return (
                    <>
                        <h2 className="text-lg font-semibold">Create Note</h2>
                        <p className="mt-2 text-sm text-gray-300">
                            New note will be created in{" "}
                            <span className="font-medium text-white">{modalContext.notebookName}</span>.
                        </p>
                        <div className="mt-4 flex justify-end gap-2">
                            <button className="rounded border border-gray-600 px-3 py-2 text-sm" onClick={closeModal}>
                                Cancel
                            </button>
                            <button
                                className="rounded bg-blue-600 px-3 py-2 text-sm text-white"
                                onClick={() => {
                                    // Example: call create note API here with modalContext.notebookId
                                    closeModal();
                                }}
                            >
                                Create Note
                            </button>
                        </div>
                    </>
                );
            case "createStack":
                return (
                    <>
                        <h2 className="text-lg font-semibold">Create Stack</h2>
                        <p className="mt-2 text-sm text-gray-300">
                            This could contain an input and submit handler for stack creation.
                        </p>
                        <div className="mt-4 flex justify-end gap-2">
                            <button className="rounded border border-gray-600 px-3 py-2 text-sm" onClick={closeModal}>
                                Cancel
                            </button>
                            <button
                                className="rounded bg-green-600 px-3 py-2 text-sm text-white"
                                onClick={() => {
                                    // Example: call create stack API here
                                    closeModal();
                                }}
                            >
                                Create Stack
                            </button>
                        </div>
                    </>
                );
            default:
                return null;
        }
    }

    return (
        <section className="space-y-4 p-4">
            <h1 className="text-xl font-bold">NotebooksPanel Modal Pattern Example</h1>

            <div className="flex flex-wrap gap-2">
                <button
                    className="rounded bg-red-700 px-3 py-2 text-sm text-white"
                    onClick={() =>
                        openModal("delete", {
                            notebookId: 42,
                            notebookName: "Personal",
                        })
                    }
                >
                    Open Delete Modal
                </button>

                <button
                    className="rounded bg-blue-700 px-3 py-2 text-sm text-white"
                    onClick={() =>
                        openModal("createNote", {
                            notebookId: 42,
                            notebookName: "Personal",
                        })
                    }
                >
                    Open Create Note Modal
                </button>

                <button className="rounded bg-green-700 px-3 py-2 text-sm text-white" onClick={() => openModal("createStack")}>
                    Open Create Stack Modal
                </button>
            </div>

            <Modal isOpen={isModalOpen} setIsOpen={setIsModalOpen} title="Notebook action modal">
                {renderModalContent()}
            </Modal>
        </section>
    );
}
