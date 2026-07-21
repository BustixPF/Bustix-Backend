import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersRepository {

  private users: any[] = [];

  async getUserByEmail(email: string): Promise<any> {
    
    const user = this.users.find(u => u.email === email);
    return user || null;
  }

  async addUser(user: any): Promise<any> {
    const newId = (this.users.length + 1).toString(); 
    
   
    const userToSave = {
      id: newId,
      ...user,
      isAdmin: false 
    };

    this.users.push(userToSave);
    
    return newId; 
  }
}