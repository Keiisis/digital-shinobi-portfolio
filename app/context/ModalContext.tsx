"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface ModalContextType {
    isProjectModalOpen: boolean
    setProjectModalOpen: (open: boolean) => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: ReactNode }) {
    const [isProjectModalOpen, setProjectModalOpen] = useState(false)

    return (
        <ModalContext.Provider value={{ isProjectModalOpen, setProjectModalOpen }}>
            {children}
        </ModalContext.Provider>
    )
}

export function useModal() {
    const context = useContext(ModalContext)
    if (!context) {
        throw new Error("useModal must be used within a ModalProvider")
    }
    return context
}
