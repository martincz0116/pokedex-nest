import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {
  private defaultLimit: number;
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,

    private readonly configService: ConfigService
  ) {
    this.defaultLimit = configService.get<number>('defaultLimit');
  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase().trim();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = this.defaultLimit, offset = 0 } = paginationDto
    return await this.pokemonModel.find().limit(limit).skip(offset);
  }

  async findOne(term: string) {
    try {
      let pokemon: Pokemon;
      if (!isNaN(+term)) {
        pokemon = await this.pokemonModel.findOne({ no: +term });
      } else if (isValidObjectId(term)) {
        pokemon = await this.pokemonModel.findById(term);
      } else {
        pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase().trim() });
      }

      if (!pokemon) {
        throw new NotFoundException(`El pokemon ${term} no existe`);
      }

      return pokemon;

    } catch (error) {
      throw new InternalServerErrorException('No se pudo encontrar el pokemon');
    }
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);

    try {
      if (updatePokemonDto.name) {
        updatePokemonDto.name = updatePokemonDto.name.toLowerCase()

        await pokemon.updateOne(updatePokemonDto);
      }

      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });

    if (deletedCount === 0) {
      throw new BadRequestException(`El pokemon ${id} no existe`);
    }

    return;
  }

  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(`El pokemon ${JSON.stringify(error.keyValue)} ya existe`);
    }
    console.log(error);
    throw new InternalServerErrorException('No se pudo crear el pokemon');
  }
}
