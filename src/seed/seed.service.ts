import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';
import { CreatePokemonDto } from 'src/pokemon/dto/create-pokemon.dto';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter
  ) { }

  async executeSeed() {
    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=10');
    const insertPromises = [];

    data.results.forEach(async ({ name, url }) => {
      const segments = url.split('/');
      const no: number = +segments[segments.length - 2];

      const pokemon: CreatePokemonDto = { no, name };
      insertPromises.push(pokemon);
    });

    await this.pokemonModel.insertMany(insertPromises);
    return `Seed executed`;
  }
}
