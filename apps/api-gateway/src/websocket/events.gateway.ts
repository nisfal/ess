import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(EventsGateway.name);

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to WebSocket: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from WebSocket: ${client.id}`);
  }

  @SubscribeMessage('join_admin_room')
  handleJoinAdminRoom(client: Socket) {
    client.join('admin-room');
    this.logger.log(`Client ${client.id} joined admin-room`);
    return { event: 'joined_admin_room', status: 'success' };
  }

  notifyAdminProfileUpdate(data: {
    employeeId: string;
    employeeName: string;
    employeeEmail: string;
    changedFields: string[];
    timestamp: Date;
    details?: any;
  }) {
    this.logger.log(
      `Broadcasting profile update alert for employee ${data.employeeName} (${data.employeeEmail})`,
    );
    // Broadcast to everyone and specifically to admin-room
    this.server.emit('admin:profile_updated', data);
  }
}
