let {app, mongoose} = require('../src/app');
let supertest = require('supertest');
let request = supertest(app)
let userAny = {name: 'userTest', email: 'user@teste.com', password: 'adminPassword'}
let post = {
  title: 'Estação espacial',
  body: 'Um body qualquer',
  test: true
}
var idPostValido = "";
var tokenValido = {}
var userIdValido = ''
var tokenOutroUsuario = { authorization:"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Inh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4IiwibmFtZSI6ImdhYnJpZWwiLCJpZCI6IjYxMTFhZmUwZTk2YzU5NTU5MDk3NDU4MiIsImlhdCI6MTYyODU0OTEwMiwiZXhwIjoxNjI4NjM1NTAyfQ.KoZ-9kARvyhptMKAtTzdiH_mlrzo8RTiNuGS2_daJG0"}
afterAll(() => {
  // Finalização da suite
  return request.delete(`/user/${userAny.email}`).then(res => {
    return request.delete(`/image`).then(res => {
      return mongoose.connection.close();
    })
  })
})

describe("Login no sistema", () => {
  test("Deve acessar o sistema e fornecer um token válido para os outros testes", () => {
    return request.post('/auth')
      .send({email: 'gabriel', password: 'gabriel'})
      .then(res => {
        tokenValido = { authorization:"Bearer " + res.body.token}
        userIdValido = res.body.id;
      }).catch(error => fail(error))
  })
})

describe('Gerenciamento de posts', () => {
  test("Deve cadastrar um post", () => {

    return request.post('/user')
      .send(userAny).then(res => {
        return request.post('/post')
          .send(post)
          .set(tokenValido)
          .then(res => {
            expect(res.statusCode).toEqual(200)
            idPostValido = res.body._id

      }).catch(error => {fail(error)})
    }).catch(error2 => {fail(error2)})
  })


  test("Deve retornar uma lista com todos os usuários e suas imagens", () => {
    return request.get('/posts')
      .set(tokenValido)
      .then(res => {
        expect(res.statusCode).toEqual(200)
        expect(res.body[0].body).toBeDefined()
    }).catch(error => fail(error))
  })
  
  test("Deve retornar um post", () => {
    return request.get(`/post/${idPostValido}`)
      .set(tokenValido)
      .then(res => {
        expect(res.statusCode).toEqual(200)
        expect(res.body[0].user.name).toBeDefined()
        expect(res.body[0].body).toBeDefined()
    }).catch(error => fail(error))
  })

  test("Deve retornar erro 500 para um parametro invalido", () => {
    return request.get('/post/aaaaaa')
      .set(tokenValido)
      .then(res => {
        expect(res.statusCode).toEqual(500)
    }).catch(error => fail(error))
  })

  test("Deve retornar erro 404 ao não encontrar o post", () => {
    return request.get('/post/111111111111111111111111')
      .set(tokenValido)
      .then(res => {
        expect(res.statusCode).toEqual(404)
    }).catch(error => fail(error))
  })


  test("Deve retornar erro 400 ao tentar editar um post passando parametros incorretos", () => {
    return request.put(`/post/${idPostValido}`, {})
      .set(tokenValido)
      .send({title: ''})
      .then(res => {
        expect(res.statusCode).toEqual(400)
    }).catch(error => fail(error))
  })
  
  test("Deve permitir a edição de um post!", () => {
    return request.put(`/post/${idPostValido}`)
      .set(tokenValido)
      .send({title: 'test1z', body: 'test1z'})
      .then(res => {
        expect(res.statusCode).toEqual(200)
        expect(res.body.title).toEqual('test1z')
    }).catch(error => fail(error))
  })



  test("Não deve permitir a edição de um post por um usuário que não o postou", () => {
    return request.put(`/post/${idPostValido}`)
      .set(tokenOutroUsuario)
      .send({title: 'test1z', body: 'test1z'})
      .then(res => {
        expect(res.statusCode).toEqual(403)
    }).catch(error => fail(error))
  })
})


