export interface BaseModel {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    isdeleted: boolean;
}