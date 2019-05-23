var expect = require('chai').expect
var FileUtil = require('../src/FileUtil')

describe('FileUtil', function () {

  it('lists files recursively', function () {
    var files = FileUtil.listFilesRecursively('test/res/fileUtil')
    expect(files.length).to.equal(4)
  })
  
})
