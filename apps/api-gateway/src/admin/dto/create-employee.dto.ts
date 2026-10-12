import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama karyawan tidak boleh kosong' })
  name: string;

  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Nomor handphone tidak boleh kosong' })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: 'Posisi / jabatan tidak boleh kosong' })
  position: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
