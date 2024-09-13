// https://servicodados.ibge.gov.br/api/v1/localidades/estados/

// Ranking do brasil todo de 2010
// https://servicodados.ibge.gov.br/api/v2/censos/nomes/ranking/?decada=2010

// Ranking de nomes no Mato Grosso
// https://servicodados.ibge.gov.br/api/v2/censos/nomes/ranking?localidade=51

// Ranking de nomes em Cáceres
// https://servicodados.ibge.gov.br/api/v2/censos/nomes/ranking?localidade=5102504

// Número por período, em Mato Grosso
// https://servicodados.ibge.gov.br/api/v2/censos/nomes/GABRIEL?localidade=51

// Número por período, em Cáceres
// https://servicodados.ibge.gov.br/api/v2/censos/nomes/GABRIEL?localidade=5102504

const estado = "51"; // Mato Grosso
const municipios = [];
const pessoa = []
async function GetMunicipios() {
  const url = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios`;
  
  try {
    const response = await fetch(url);

    if (!response.ok)
      throw new Error('Erro na API:', response.statusText);

    const data = await response.json();
    const entries = Object.entries(data);

    entries.forEach(entry => {
      const municipio = Object.entries(entry[1]);
      const id_nome = municipio.splice(0, 2);
      const [id, nome] = id_nome.map(obj => obj[1]);

      municipios.push({
        id,
        nome
      });
    });

    console.log(municipios);
  } catch (error) {
    console.error('GetMunicipio\n', error);
  }
};
GetMunicipios();

async function GetTopNome() {
  const url = `https://servicodados.ibge.gov.br/api/v2/censos/nomes/ranking?localidade=${estado}`;

  try {
    const response = await fetch(url);

    if (!response.ok)
      throw new Error('Erro na API:', response.statusText);

    const data = await response.json();
    const entry = Object.entries(data[0].res);
    const nome_freq = entry.splice(0, 1);
    const [nome, freq] = nome_freq[0][1].map(value => value)
    
  } catch (error) {
    console.error('GetTopNomes\n', error);
  }
};
GetTopNome();

async function GetNameByCity(name, cityCod) {
  const url = `https://servicodados.ibge.gov.br/api/v2/censos/nomes/${name}?localidade=${cityCod}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Erro na requisição: ' + response.statusText);
    }

    return response.json()
      .then(data => {
        return data[0];
      })
      .then(data => {
        return data.res;
      })
      .then(data => {
        const dataObject = Object.entries(data);
        const result = dataObject[dataObject.length - 1][1].frequencia;
        return result;
      })
  } catch (error) {
    console.log("GetNameByCity Error\n", error);
  }
}

function convertArrayToCSV(array) {
  const header = Object.keys(array[0]);
  const rows = array.map(row => header.map(fieldName => JSON.stringify(row[fieldName])).join(','));
  rows.unshift(header.join(','));

  return rows.join('\r\n');
}

function downloadCSV(array) {
  const csv = convertArrayToCSV(array);
  const csvData = new Blob([csv], { type: 'text/csv' });
  const csvUrl = URL.createObjectURL(csvData);

  const link = document.createElement('a');
  link.href = csvUrl;
  link.download = 'dadosProbabilidadeEstatistica.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function Init() {
  const NamesRanking = await GetNamesRanking();
  const result = [];
  let times = 0;

  try {
    for (const element of NamesRanking) {
      const name = element.nome;
      const stateValue = element.frequencia;

      const entry = {
        nome: name,
        matogrosso: stateValue
      };

      for (const [cityName, cityCod] of Object.entries(municipio)) {
        entry[cityName] = await GetNameByCity(name, cityCod);
      }

      result.push(entry);
    }
  } catch (error) {
    console.error("Init Error\n", error);
  }

  if (times !== 0) {
    downloadCSV(result);
    times++;
  }
}

//Init();
