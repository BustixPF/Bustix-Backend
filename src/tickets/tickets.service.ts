import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { User } from '../users/entities/user.entity';
import { Company } from '../companies/entities/company.entity';

interface CreateTicketData {
  origin: string;
  destination: string;
  price: number;
  userId: string;
  companyId: string;
}

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
  ) {}

  create(data: CreateTicketData) {
    const ticket = this.ticketsRepository.create({
      origin: data.origin,
      destination: data.destination,
      price: data.price,
      user: { id: data.userId } as User,
      company: { id: data.companyId } as Company,
    });
    return this.ticketsRepository.save(ticket);
  }

  findByUser(userId: string) {
    return this.ticketsRepository.find({
      where: { user: { id: userId } },
      relations: { company: true },
      order: { purchaseDate: 'DESC' },
    });
  }
}
