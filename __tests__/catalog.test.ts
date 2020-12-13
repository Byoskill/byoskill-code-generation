import { expect } from 'chai';
import Catalog from '../src/catalog';


test('Parsing a catalog as JSON object', () => {
    const catalog = new Catalog("./examples/exampleCatalog.json");
    const content = catalog.expectJsonObjectFile();
    console.log(content);
    expect(content.pair1).to.equal('abc');
    expect(content.pair2).to.equal('cde');
});