import dotenv from "dotenv";
dotenv.config();
import request from 'supertest';
import prisma from '../prisma/prismaClient';
import app from '../app';

const GET_INIT_DATA = process.env.INIT_DATA_TEST || ''

const newFolder = {
  name: 'New Folder',
  type: 'parent',
  description: 'Description of the new folder',
  about: 'About the new folder',
};

let folderId: string;


describe('Folder Routes', () => {
  beforeAll(async () => {
    const folder = await prisma.folder.create({
      data: {
        name: 'Test Folder',
        type: 'parent',
        description: 'Test description',
        about: 'Test about',
      },
    });
    folderId = folder.id;
  });

  afterAll(async () => {
    await prisma.folder.deleteMany({});
  });

  it('should create a folder', async () => {
    const response = await request(app)
      .post('/folders')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('init-data', GET_INIT_DATA)
      .send(newFolder);

    expect(response.status).toBe(201);
    expect(response.body.name).toBe(newFolder.name);
    expect(response.body.type).toBe(newFolder.type);
    expect(response.body.description).toBe(newFolder.description);
  });

  it('should get a folder by id', async () => {
    const response = await request(app)
      .get(`/folders/${folderId}`)
      .set('Accept', 'application/json')
      .set('init-data', GET_INIT_DATA);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(folderId);
    expect(response.body.name).toBe('Test Folder');
  });

  it('should return 404 if folder not found', async () => {
    const response = await request(app)
      .get('/folders/invalid-id')
      .set('Accept', 'application/json')
      .set('init-data', GET_INIT_DATA);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Folder not found');
  });

  it('should delete a folder', async () => {
    const response = await request(app)
      .delete(`/folders/${folderId}`)
      .set('Accept', 'application/json')
      .set('init-data', GET_INIT_DATA); 

    expect(response.status).toBe(204); 
  });

  it('should return 404 when trying to delete a non-existing folder', async () => {
    const response = await request(app)
      .delete('/folders/invalid-id')
      .set('Accept', 'application/json')
      .set('init-data', GET_INIT_DATA); 

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Folder not found');
  });
});
