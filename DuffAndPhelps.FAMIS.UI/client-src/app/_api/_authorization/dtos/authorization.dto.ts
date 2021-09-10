export interface Authorization {
    Roles: string[];
    HasSubscription: boolean;
    SubscriptionId: string |null;
}

export interface Role {
    Id: string;
    Name?: string;
}
