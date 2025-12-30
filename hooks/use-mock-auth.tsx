import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// Mock user data matching the shape expected by components
const MATCHED_USER = {
    id: "user_123",
    fullName: "Admin User",
    imageUrl: "https://github.com/shadcn.png",
    emailAddresses: [{ emailAddress: "admin@tapango.logistics" }],
}

// Mock organization data
const MOCK_ORGS = [
    {
        id: "org_1",
        name: "Tapango Logistics",
        slug: "tapango",
        imageUrl: "/logo.png", // Ensure you have a placeholder or use a valid URL
        hasImage: true,
    },
    {
        id: "org_2",
        name: "Acme Corp",
        slug: "acme",
        imageUrl: "",
        hasImage: false,
    },
]

export function useUser() {
    return {
        user: MATCHED_USER,
        isLoaded: true,
        isSignedIn: true,
    }
}

export function useOrganization() {
    const [orgId, setOrgId] = useState<string | null>("org_1")

    const organization = MOCK_ORGS.find((o) => o.id === orgId)

    return {
        organization,
        isLoaded: true,
    }
}

export function useOrganizationList({ userMemberships }: any = {}) {
    const [activeOrgId, setActiveOrgId] = useState("org_1")

    const memberships = MOCK_ORGS.map((org) => ({
        id: `mem_${org.id}`,
        role: "admin",
        organization: org,
    }))

    const setActive = async ({ organization }: { organization: string }) => {
        setActiveOrgId(organization)
        console.log("Set active org to:", organization)
        return Promise.resolve()
    }

    return {
        isLoaded: true,
        userMemberships: {
            data: memberships,
            revalidate: async () => console.log("Revalidating memberships..."),
        },
        setActive,
    }
}

export function useAuth() {
    const { organization } = useOrganization()
    return {
        orgId: organization?.id,
        userId: "user_123",
        sessionId: "sess_123",
        isLoaded: true,
        isSignedIn: true,
        signOut: () => console.log("Mock sign out"),
    }
}

export const SignOutButton = ({ children, redirectUrl }: any) => {
    const router = useRouter()
    return (
        <div onClick= {() => router.push(redirectUrl || '/')}>
            { children || "Sign Out"}
</div>
    )
}
