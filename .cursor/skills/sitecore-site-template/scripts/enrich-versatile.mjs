#!/usr/bin/env node
/**
 * Adds the Versatile solution template, page types, renderings, presentation,
 * and preview-site pages onto YAML produced by the collection and site generators.
 * Ids are hashed from stable names so a second run rewrites the same items.
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const ROOT = join(REPO, 'authoring', 'items', 'site-templates', 'versatile', 'serialized-content');

const TEMPLATES = '170499a9-fa6b-4cf9-bb3a-88ce7194267a';
const PAGE = '6a6addb4-ddb9-489e-a329-d90f57a9e656';
const PAGE_SV = '4eec0dd1-2d5b-419a-a27d-3101c851eea0';
const PROJECT_SETTINGS = 'a17a6dc3-77aa-4e68-b54c-2d23e1628620';
const BRANCHES = '96cbba48-7ce4-461b-b6ef-4c8e438029ad';
const RENDERINGS = 'e3ce4f4d-143e-4087-84c2-b644352c8815';
const SITE = '64e22265-58f1-4693-82f1-7af7b84f9874';
const HOME = '57c9f1bb-a716-41f4-8fc2-5e74c5162f50';
const SETTINGS = '41277a68-2a99-4880-ba5e-d86899a372f1';
const DATA = '76b3c5ce-ef89-41b1-91d4-48799610d05b';
const PAGE_DESIGNS = 'c1696f84-eac3-4f25-bd06-db314187e79d';
const PARTIAL_DESIGNS = '9869aab0-011a-42b9-a4e5-01a142e854a6';
const PARTIAL_DESIGN_PLACEHOLDERS = '035ff71f-95bb-48a5-a06d-310b2f35d69c';
const AVAILABLE = 'e93974cf-2a7e-4a29-afe1-e9cfe8af33cb';
const SPE_PARENT = '24c0822d-b736-42a5-a6fc-a3c4bfdebc29';

const DATA_TEMPLATE = 'ab86861a-6030-46c5-b394-e8f99e8b87db';
const SECTION = 'e269fbb5-3750-427a-9149-7aa950b49301';
const FIELD = '455a3e98-a627-4b40-8035-e683a0331ac7';
const FOLDER = 'a87a00b1-e6db-45ab-8b54-636fec3b5523';
const JSON_RENDERING = '04646a89-996f-4ee7-878a-ffdbf1f0ef0d';
const BRANCH = '35e75c72-4985-4e09-88c3-0eac6cd1e64f';
const SOLUTION = '1b2dfd3b-f2f2-4f40-a75c-f6c2490919c4';
const SETUP_ROOT = 'bed31d6f-d968-45a9-b54e-12d7f977d861';
const ADD_ITEM = '3aea335c-d06d-45b1-841a-cbc8d2d1ce40';
const PARTIAL = 'fd2059fd-6043-4dfe-8c04-e2437ce87634';
const PAGE_DESIGN = '1105b8f8-1e00-426b-bf1f-c840742d827b';
const PLACEHOLDER = 'd2a6884c-04d5-4089-a64e-d27ca9d68d4c';
const AVAILABLE_ITEM = '76da0a8d-fc7e-42b2-af1e-205b49e43f98';
const SPE_MODULE = '6d82fcd8-c379-443c-97a9-c6423c71e7d5';
const SETTINGS_FOLDER = 'b4d86f9b-e917-4d68-978e-741361332174';

const BASIC_WORKFLOW = '{B4F49B23-4BBA-4C79-BA22-F89F5F0D4E4F}';
const DATASOURCE_WORKFLOW = '{A053ED9F-4099-4682-9411-2B4C98E481E4}';
const DEVICE = '{FE5D7FDF-89C0-4D99-9AA3-B5FBD009C9F3}';
const LAYOUT = '{96E5F4BA-A2CF-4A4C-A4E7-64DA88226362}';

const HOME_PROTO = '{E96B4685-0341-4077-AFCE-BCCE690B3927}';
const SETTINGS_PROTO = '{9AF6CE61-4FC5-43EE-9014-03E9D9C9C3DF}';
const DATA_PROTO = '{BA2F959D-A614-4C92-8B57-F1FC1A323ABE}';
const PAGE_DESIGNS_PROTO = '{AB94FEC8-3DCA-40DC-86BC-8402FA98AC09}';
const PARTIALS_PROTO = '{98AB60C3-0FE5-467B-A6C7-ABD981E30E7A}';

const BASIC_MODULES = [
  '5A2F6A6F-3028-4210-AAD3-82C1365C4802',
  '9F10010E-49E2-4DCD-A5A1-4DA752ADED2A',
  '4342A029-0186-4B0D-8959-FFEF4FD998C2',
  'AE5D1384-BB75-4C6B-A8B5-4B008C2AC5DA',
  'C4658673-5D70-44ED-9004-D66EAC1DC718',
  'CA502DCF-20D2-4618-A735-E4FCB6D5E114',
  'E2AF1A41-799E-481B-8FDC-B2D33FB729A1',
  '66B9C663-2602-42B1-A5A2-3D04DB6C506A',
  '1FD78E81-59A6-4513-90F1-165A95D4B16B',
  'BEBF4026-24A3-4EA6-986A-518B76DBD71A',
  '385F31BE-FF0C-4D84-A627-9ECD21295AFD',
  'F0EA389E-F78D-440B-9429-F04FE735344A',
  'AC1A27CA-6BF3-4D23-915E-668326D52CF1',
  'D7EEAF4D-2B58-4029-B141-844221565EF0',
  '1F35559F-2140-4774-8BC1-525BB722BAA2',
];

const TENANT_MODULES = [
  '7B81B847-1891-43B2-BC13-5047A62EC32A',
  '7BAAA4FC-3051-442D-9BD2-AD720B655E0B',
  '0DC2E395-4A95-4773-88CA-75B22A130849',
  '4346A98A-D6E9-491E-A0ED-CD12F524CF4E',
  '4CBC64BF-8116-48A1-ABAC-DB19103897A6',
  '7574F439-0B48-48BE-BA6B-94B1A3CE01A3',
  'D912C30C-7A98-4A8D-A094-611D9AF9605D',
  '6DE1F4E9-815D-491D-923D-D5038100DBEE',
  '02CD7086-1F87-41EC-B40F-B92C1226895B',
  '1B0A98C0-1801-44A0-85F2-845694FEAFF3',
  'D315A501-6503-4545-A5D8-B9FECBA1097D',
];

const PAGE_TYPES = ['Home', 'Landing', 'Listing', 'Detail', 'Article', 'Contact', 'Search'];
const SIGNATURES = ['header', 'footer', 'home', 'landing', 'listing', 'detail', 'article', 'contact', 'search'];

const COMPONENTS = [
  ['Header', []],
  ['Footer', []],
  ['Navigation', []],
  ['Breadcrumb', []],
  ['LanguageSwitcher', []],
  ['Hero', [['Title', 'Single-Line Text'], ['Subtitle', 'Single-Line Text'], ['Image', 'Image'], ['Link', 'General Link']]],
  ['RichText', [['Body', 'Rich Text']]],
  ['Promo', [['Title', 'Single-Line Text'], ['Image', 'Image'], ['Summary', 'Multi-Line Text'], ['Link', 'General Link']]],
  ['Card', [['Title', 'Single-Line Text'], ['Image', 'Image'], ['Summary', 'Multi-Line Text'], ['Link', 'General Link']]],
  ['Accordion', [['Title', 'Single-Line Text'], ['Body', 'Rich Text']]],
  ['Cta', [['Title', 'Single-Line Text'], ['Summary', 'Multi-Line Text'], ['Link', 'General Link']]],
  ['Media', [['Title', 'Single-Line Text'], ['Image', 'Image']]],
  ['Image', [['Image', 'Image']]],
  ['Video', [['Title', 'Single-Line Text'], ['Link', 'General Link']]],
  ['Testimonial', [['Title', 'Single-Line Text'], ['Summary', 'Multi-Line Text'], ['Image', 'Image']]],
  ['Listing', [['Title', 'Single-Line Text'], ['Summary', 'Multi-Line Text']]],
  ['Detail', [['Title', 'Single-Line Text'], ['Image', 'Image'], ['Summary', 'Multi-Line Text'], ['Tags', 'Single-Line Text'], ['Link', 'General Link'], ['Body', 'Rich Text']]],
  ['Article', [['Title', 'Single-Line Text'], ['Image', 'Image'], ['Summary', 'Multi-Line Text'], ['Body', 'Rich Text']]],
  ['Search', [['Title', 'Single-Line Text']]],
  ['ContactForm', [['Title', 'Single-Line Text'], ['Summary', 'Multi-Line Text']]],
  ['Container', []],
  ['RowSplitter', []],
  ['ColumnSplitter', []],
  ['PartialDesignDynamicPlaceholder', []],
];

const COPY = {
  Hero: { Title: 'A place to begin', Subtitle: 'Real estate, retail, or a campaign', Summary: '' },
  Listing: { Title: 'Featured listings', Summary: 'Properties, products, or offers use the same listing.' },
  Cta: { Title: 'Talk to the team', Summary: 'Send a question. A person replies.' },
  ContactForm: { Title: 'Contact', Summary: 'Name, email, and a short message.' },
  Promo: { Title: 'Selected for this season', Summary: 'A short offer, with a link through to the detail.' },
  Card: { Title: 'One offer', Summary: 'A card works for a property, a product, or a campaign.' },
  RichText: { Body: 'Write the story here. The same page types serve a catalogue and a launch.' },
  Testimonial: { Title: 'In their words', Summary: 'A short quote from a customer.' },
  Article: { Title: 'From the journal', Summary: 'A story that sits beside the catalogue.' },
  Detail: { Title: 'The detail', Summary: 'Title, image, summary, tags, link, and body.', Tags: 'featured' },
  Search: { Title: 'Search' },
  Accordion: { Title: 'More detail', Body: 'Open this while editing. It stays open for authors.' },
  Media: { Title: 'Image' },
};

function id(name) {
  const h = createHash('sha1').update(`versatile-site-template:${name}`).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

function brace(value) {
  return `{${value.toUpperCase()}}`;
}

function yamlValue(value) {
  if (value.includes('\n')) return `|\n${value.split('\n').map((line) => `    ${line}`).join('\n')}`;
  if (value === '' || /[:#&*!|>'"%@`]/.test(value) || value.startsWith('{') || value.startsWith('%')) {
    return JSON.stringify(value);
  }
  return value;
}

function itemYaml({ itemId, parent, template, path, shared = [], versioned = [] }) {
  const sharedBlock = shared
    .map((field) => `- ID: "${field.id}"\n  Hint: ${field.hint}\n  Value: ${yamlValue(field.value)}`)
    .join('\n');
  const versionedBlock = versioned
    .map((field) => `    - ID: "${field.id}"\n      Hint: ${field.hint}\n      Value: ${yamlValue(field.value)}`)
    .join('\n');
  return `---
ID: "${itemId}"
Parent: "${parent}"
Template: "${template}"
Path: ${JSON.stringify(path)}
${shared.length ? `SharedFields:\n${sharedBlock}\n` : ''}Languages:
- Language: en
  Versions:
  - Version: 1
    Fields:
    - ID: "25bed78c-4957-4165-998a-ca1b52f67497"
      Hint: __Created
      Value: 20261022T000000Z
    - ID: "8cdc337e-a112-42fb-bbb4-4143751e123f"
      Hint: __Revision
      Value: "${id(`rev:${path}`)}"
    - ID: "d9cf14b1-fa16-4ba6-9288-e8a174d4d522"
      Hint: __Updated
      Value: 20261022T000000Z
${versionedBlock ? `${versionedBlock}\n` : ''}`;
}

const files = new Map();

function add(relativePath, contents) {
  files.set(relativePath.replaceAll('\\', '/').replaceAll('$name.yml', '#name.yml'), contents);
}

function templateItem(itemId, parent, path, bases, standardValues) {
  add(
    sitecoreToDisk(path),
    itemYaml({
      itemId,
      parent,
      template: DATA_TEMPLATE,
      path,
      shared: [
        { id: '12c33f3f-86c5-43a5-aeb4-5598cec45116', hint: '__Base template', value: bases },
        { id: 'f7d48a55-2158-4f02-9356-756654404f73', hint: '__Standard values', value: brace(standardValues) },
      ],
    }),
  );
}

function sectionItem(itemId, parent, path) {
  add(sitecoreToDisk(path), itemYaml({ itemId, parent, template: SECTION, path }));
}

function fieldItem(itemId, parent, path, type) {
  add(
    sitecoreToDisk(path),
    itemYaml({
      itemId,
      parent,
      template: FIELD,
      path,
      shared: [{ id: 'ab162cc0-dc80-4abf-8871-998ee5d7ba32', hint: 'Type', value: type }],
    }),
  );
}

function standardValues(itemId, parent, path, workflow) {
  add(
    sitecoreToDisk(path),
    itemYaml({
      itemId,
      parent,
      template: parent,
      path,
      shared: [{ id: 'ca9b9f52-4fb0-4f87-a79f-24dea62cda65', hint: '__Default workflow', value: workflow }],
    }),
  );
}

function sitecoreToDisk(path) {
  if (path.startsWith('/sitecore/templates/Project/versatile')) {
    return `templates/versatile/${path.split('/versatile/')[1]}.yml`;
  }
  if (path.startsWith('/sitecore/templates/Branches/Project/versatile')) {
    return `branches/versatile/${path.split('/versatile/')[1]}.yml`;
  }
  if (path.startsWith('/sitecore/layout/Renderings/Project/versatile')) {
    return `renderings/versatile/${path.split('/versatile/')[1]}.yml`;
  }
  if (path.startsWith('/sitecore/system/Settings/Project/versatile')) {
    return `project-settings/versatile/${path.split('/versatile/')[1]}.yml`;
  }
  if (path.startsWith('/sitecore/system/Modules/PowerShell/Script Library/JSS SXA/Versatile')) {
    return 'powershell/Versatile.yml';
  }
  if (path.startsWith('/sitecore/content/versatile/versatile-preview')) {
    return `versatile-preview/versatile-preview/${path.split('/versatile-preview/')[1]}.yml`;
  }
  throw new Error(`Unmapped path ${path}`);
}

function layoutXml(entries) {
  let previous = '';
  const rows = entries.map((entry) => {
    const uid = id(`uid:${entry.key}`);
    const position = previous ? `p:after="r[@uid='{${previous.toUpperCase()}}']"` : 'p:before="*"';
    previous = uid;
    const ds = entry.datasource ? ` s:ds="${entry.datasource}"` : '';
    const par = entry.params ? ` s:par="${entry.params}"` : '';
    return `        <r uid="{${uid.toUpperCase()}}" ${position}${ds} s:id="{${entry.rendering.toUpperCase()}}"${par} s:ph="${entry.placeholder}" />`;
  });
  return `<r xmlns:p="p" xmlns:s="s" p:p="1">\n      <d id="${DEVICE}" l="${LAYOUT}">\n${rows.join('\n')}\n      </d>\n    </r>`;
}

function componentId(name) {
  return id(`rendering:${name}`);
}

function encodeMapping(templateId, designId) {
  return `%7b${templateId.toUpperCase()}%7d%3d%257B${designId.toUpperCase()}%257D`;
}

const pageTypeIds = Object.fromEntries(PAGE_TYPES.map((name) => [name, id(`page:${name}`)]));
const pageSvIds = Object.fromEntries(PAGE_TYPES.map((name) => [name, id(`page-sv:${name}`)]));
const brandTemplate = id('template:Brand');
const brandSv = id('template:Brand:sv');
const setupId = id('setup:Versatile');
const solutionId = id('solution:Versatile');

const CONTENT_FIELDS = [
  ['Title', 'Single-Line Text'],
  ['Image', 'Image'],
  ['Summary', 'Multi-Line Text'],
  ['Tags', 'Single-Line Text'],
  ['Link', 'General Link'],
  ['Body', 'Rich Text'],
];

for (const name of PAGE_TYPES) {
  const templatePath = `/sitecore/templates/Project/versatile/Pages/${name}`;
  templateItem(pageTypeIds[name], id('folder:Pages'), templatePath, brace(PAGE), pageSvIds[name]);
  standardValues(
    pageSvIds[name],
    pageTypeIds[name],
    `${templatePath}/__Standard Values`,
    BASIC_WORKFLOW,
  );
  if (name === 'Listing' || name === 'Detail' || name === 'Article') {
    const section = id(`page-section:${name}`);
    sectionItem(section, pageTypeIds[name], `${templatePath}/Content`);
    for (const [fieldName, type] of CONTENT_FIELDS) {
      fieldItem(id(`page-field:${name}:${fieldName}`), section, `${templatePath}/Content/${fieldName}`, type);
    }
  }
}

add(
  'templates/versatile/Pages.yml',
  itemYaml({
    itemId: id('folder:Pages'),
    parent: TEMPLATES,
    template: FOLDER,
    path: '/sitecore/templates/Project/versatile/Pages',
  }),
);

templateItem(
  brandTemplate,
  TEMPLATES,
  '/sitecore/templates/Project/versatile/Brand',
  '{1930BBEB-7805-471A-A3BE-4858AC7CF696}\n{44A022DB-56D3-419A-B43B-E27E4D8E9C41}',
  brandSv,
);
standardValues(brandSv, brandTemplate, '/sitecore/templates/Project/versatile/Brand/__Standard Values', DATASOURCE_WORKFLOW);
const brandSection = id('section:Brand');
sectionItem(brandSection, brandTemplate, '/sitecore/templates/Project/versatile/Brand/Brand');
for (const [fieldName, type] of [
  ['Logo', 'Image'],
  ['LogoAlt', 'Single-Line Text'],
  ['Primary', 'Single-Line Text'],
  ['Secondary', 'Single-Line Text'],
  ['Accent', 'Single-Line Text'],
  ['Background', 'Single-Line Text'],
  ['Foreground', 'Single-Line Text'],
  ['HeadingFont', 'Single-Line Text'],
  ['BodyFont', 'Single-Line Text'],
]) {
  fieldItem(id(`brand-field:${fieldName}`), brandSection, `/sitecore/templates/Project/versatile/Brand/Brand/${fieldName}`, type);
}

add(
  'templates/versatile/Components.yml',
  itemYaml({
    itemId: id('folder:Components'),
    parent: TEMPLATES,
    template: FOLDER,
    path: '/sitecore/templates/Project/versatile/Components',
  }),
);

for (const [name, fields] of COMPONENTS) {
  if (!fields.length && !['Header', 'Footer'].includes(name)) continue;
  if (['Header', 'Footer'].includes(name)) continue;
  const template = id(`template:${name}`);
  const sv = id(`template-sv:${name}`);
  const folderTemplate = id(`folder-template:${name}`);
  templateItem(
    template,
    id('folder:Components'),
    `/sitecore/templates/Project/versatile/Components/${name}`,
    '{1930BBEB-7805-471A-A3BE-4858AC7CF696}\n{44A022DB-56D3-419A-B43B-E27E4D8E9C41}',
    sv,
  );
  standardValues(sv, template, `/sitecore/templates/Project/versatile/Components/${name}/__Standard Values`, DATASOURCE_WORKFLOW);
  const section = id(`section:${name}`);
  sectionItem(section, template, `/sitecore/templates/Project/versatile/Components/${name}/Data`);
  for (const [fieldName, type] of fields) {
    fieldItem(id(`field:${name}:${fieldName}`), section, `/sitecore/templates/Project/versatile/Components/${name}/Data/${fieldName}`, type);
  }
  templateItem(folderTemplate, id('folder:Components'), `/sitecore/templates/Project/versatile/Components/${name} Folder`, brace(FOLDER), id(`folder-sv:${name}`));
  standardValues(id(`folder-sv:${name}`), folderTemplate, `/sitecore/templates/Project/versatile/Components/${name} Folder/__Standard Values`, DATASOURCE_WORKFLOW);
}

for (const [name] of COMPONENTS) {
  const fields = COMPONENTS.find(([component]) => component === name)[1];
  const datasourceTemplate = ['Header', 'Footer'].includes(name)
    ? brandTemplate
    : fields.length
      ? id(`template:${name}`)
      : '';
  const location = ['Header', 'Footer'].includes(name)
    ? "query:$site/*[@@name='Settings']"
    : datasourceTemplate
      ? `query:$site/*[@@name='Data']/*[@@templatename='${name} Folder']`
      : '';
  const shared = [{ id: '037fe404-dd19-4bf7-8e30-4dadf68b27b0', hint: 'componentName', value: name }];
  if (datasourceTemplate) {
    shared.push({ id: '1a7c85e5-dc0b-490d-9187-bb1dbcb4c72f', hint: 'Datasource Template', value: brace(datasourceTemplate) });
    shared.push({ id: 'b5b27af1-25ef-405c-87ce-369b3a004016', hint: 'Datasource Location', value: location });
  }
  add(
    `renderings/versatile/${name}.yml`,
    itemYaml({
      itemId: componentId(name),
      parent: RENDERINGS,
      template: JSON_RENDERING,
      path: `/sitecore/layout/Renderings/Project/versatile/${name}`,
      shared,
    }),
  );
}

const brandItem = id('content:Brand');
const brandFields = [
  ['Primary', '#1f2937'],
  ['Secondary', '#4b5563'],
  ['Accent', '#0f766e'],
  ['Background', '#fafafa'],
  ['Foreground', '#111827'],
  ['HeadingFont', 'Source Serif 4'],
  ['BodyFont', 'Source Sans 3'],
  ['LogoAlt', 'Versatile'],
].map(([name, value]) => ({ id: id(`brand-field:${name}`), hint: name, value }));

add(
  'versatile-preview/versatile-preview/Settings/Brand.yml',
  itemYaml({
    itemId: brandItem,
    parent: SETTINGS,
    template: brandTemplate,
    path: '/sitecore/content/versatile/versatile-preview/Settings/Brand',
    versioned: brandFields,
  }),
);

function datasource(component, key) {
  const itemId = id(`ds:${key}:${component}`);
  const copy = COPY[component] || {};
  const versioned = Object.entries(copy).map(([fieldName, value]) => ({
    id: id(`field:${component}:${fieldName}`),
    hint: fieldName,
    value,
  }));
  add(
    `versatile-preview/versatile-preview/Data/${component} Folder/${key}.yml`,
    itemYaml({
      itemId,
      parent: id(`data-folder:${component}`),
      template: id(`template:${component}`),
      path: `/sitecore/content/versatile/versatile-preview/Data/${component} Folder/${key}`,
      versioned,
    }),
  );
  return itemId;
}

const dataComponents = [...new Set(Object.keys(COPY))];
for (const component of dataComponents) {
  add(
    `versatile-preview/versatile-preview/Data/${component} Folder.yml`,
    itemYaml({
      itemId: id(`data-folder:${component}`),
      parent: DATA,
      template: id(`folder-template:${component}`),
      path: `/sitecore/content/versatile/versatile-preview/Data/${component} Folder`,
    }),
  );
}

function body(key, components) {
  const entries = components.map((component) => ({
    key: `${key}:${component}`,
    rendering: componentId(component),
    datasource: datasource(component, key),
    placeholder: 'headless-main',
  }));
  entries.push({
    key: `${key}:container`,
    rendering: componentId('Container'),
    placeholder: 'headless-main',
    params: 'DynamicPlaceholderId=1',
  });
  return layoutXml(entries);
}

const pages = {
  Home: ['Hero', 'Listing', 'Cta', 'ContactForm'],
  Landing: ['Hero', 'RichText', 'Testimonial', 'Cta'],
  Listing: ['Hero', 'Promo', 'Listing', 'Card'],
  Detail: ['Detail', 'Accordion'],
  Article: ['Article', 'RichText'],
  Contact: ['ContactForm'],
  Search: ['Search'],
};

const partialIds = Object.fromEntries(SIGNATURES.map((signature) => [signature, id(`partial:${signature}`)]));
const designIds = Object.fromEntries(PAGE_TYPES.map((name) => [name, id(`design:${name}`)]));

for (const signature of SIGNATURES) {
  const chrome = signature === 'header'
    ? [
        { key: 'header:header', rendering: componentId('Header'), datasource: brandItem, placeholder: 'headless-header' },
        { key: 'header:nav', rendering: componentId('Navigation'), placeholder: 'headless-header' },
        { key: 'header:crumb', rendering: componentId('Breadcrumb'), placeholder: 'headless-header' },
      ]
    : signature === 'footer'
      ? [
          { key: 'footer:footer', rendering: componentId('Footer'), datasource: brandItem, placeholder: 'headless-footer' },
          { key: 'footer:lang', rendering: componentId('LanguageSwitcher'), placeholder: 'headless-footer' },
        ]
      : [];
  add(
    `versatile-preview/versatile-preview/Presentation/Partial Designs/${signature}.yml`,
    itemYaml({
      itemId: partialIds[signature],
      parent: PARTIAL_DESIGNS,
      template: PARTIAL,
      path: `/sitecore/content/versatile/versatile-preview/Presentation/Partial Designs/${signature}`,
      shared: [
        { id: '55faae90-3bba-4f7f-96fe-13c3f40055ff', hint: 'Signature', value: signature },
        ...(chrome.length
          ? [{ id: 'f1a1fe9e-a60c-4ddb-a3a0-bb5b29fe732e', hint: '__Renderings', value: layoutXml(chrome) }]
          : []),
      ],
    }),
  );
  add(
    `versatile-preview/versatile-preview/Presentation/Placeholder Settings/Partial Design/${signature}.yml`,
    itemYaml({
      itemId: id(`ph:${signature}`),
      parent: PARTIAL_DESIGN_PLACEHOLDERS,
      template: PLACEHOLDER,
      path: `/sitecore/content/versatile/versatile-preview/Presentation/Placeholder Settings/Partial Design/${signature}`,
      shared: [{ id: '7256bdab-1fd2-49dd-b205-cb4873d2917c', hint: 'Placeholder Key', value: `sxa-${signature}` }],
    }),
  );
}

for (const name of PAGE_TYPES) {
  const signature = name.toLowerCase();
  add(
    `versatile-preview/versatile-preview/Presentation/Page Designs/${name}.yml`,
    itemYaml({
      itemId: designIds[name],
      parent: PAGE_DESIGNS,
      template: PAGE_DESIGN,
      path: `/sitecore/content/versatile/versatile-preview/Presentation/Page Designs/${name}`,
      shared: [
        {
          id: '0966b999-0d0e-4278-acc9-9da69d461fe6',
          hint: 'PartialDesigns',
          value: `${partialIds.header}|${partialIds[signature]}|${partialIds.footer}`,
        },
      ],
    }),
  );
}

for (const [name, components] of Object.entries(pages)) {
  const parent = name === 'Home' ? SITE : HOME;
  const itemId = name === 'Home' ? HOME : id(`page-item:${name}`);
  const path = name === 'Home'
    ? '/sitecore/content/versatile/versatile-preview/Home'
    : `/sitecore/content/versatile/versatile-preview/Home/${name}`;
  const versioned = [{ id: '033b0ebc-2b1e-4ce6-a5fa-142115117ca4', hint: 'Title', value: name === 'Home' ? 'Home' : name }];
  if (name === 'Listing' || name === 'Detail' || name === 'Article') {
    versioned.push({ id: id(`page-field:${name}:Title`), hint: 'Title', value: name });
    versioned.push({ id: id(`page-field:${name}:Summary`), hint: 'Summary', value: COPY[name]?.Summary || name });
  }
  const yaml = itemYaml({
    itemId,
    parent,
    template: pageTypeIds[name],
    path,
    shared: [{ id: 'f1a1fe9e-a60c-4ddb-a3a0-bb5b29fe732e', hint: '__Renderings', value: body(name, components) }],
    versioned,
  });
  add(name === 'Home' ? 'versatile-preview/versatile-preview/Home.yml' : `versatile-preview/versatile-preview/Home/${name}.yml`, yaml);
}

add(
  'versatile-preview/versatile-preview/Presentation/Available Renderings/Versatile.yml',
  itemYaml({
    itemId: id('available:Versatile'),
    parent: AVAILABLE,
    template: AVAILABLE_ITEM,
    path: '/sitecore/content/versatile/versatile-preview/Presentation/Available Renderings/Versatile',
    shared: [
      {
        id: '715ae6c0-71c8-4744-ab4f-65362d20ad65',
        hint: 'Renderings',
        value: COMPONENTS.map(([name]) => brace(componentId(name))).join('\n'),
      },
    ],
  }),
);

function branch(name, childTemplate, childShared = [], childVersioned = []) {
  const branchId = id(`branch:${name}`);
  add(
    `branches/versatile/${name}.yml`,
    itemYaml({
      itemId: branchId,
      parent: BRANCHES,
      template: BRANCH,
      path: `/sitecore/templates/Branches/Project/versatile/${name}`,
    }),
  );
  add(
    `branches/versatile/${name}/$name.yml`,
    itemYaml({
      itemId: id(`branch-child:${name}`),
      parent: branchId,
      template: childTemplate,
      path: `/sitecore/templates/Branches/Project/versatile/${name}/$name`,
      shared: childShared,
      versioned: childVersioned,
    }),
  );
  return branchId;
}

const branchIds = {};
for (const name of PAGE_TYPES) {
  branchIds[name] = branch(name, pageTypeIds[name], [
    { id: 'f1a1fe9e-a60c-4ddb-a3a0-bb5b29fe732e', hint: '__Renderings', value: body(`branch-${name}`, pages[name]) },
  ]);
}
branchIds['Property showcase'] = branch('Property showcase', pageTypeIds.Home, [
  { id: 'f1a1fe9e-a60c-4ddb-a3a0-bb5b29fe732e', hint: '__Renderings', value: body('branch-property', pages.Home) },
]);
branchIds['Retail catalogue'] = branch('Retail catalogue', pageTypeIds.Listing, [
  { id: 'f1a1fe9e-a60c-4ddb-a3a0-bb5b29fe732e', hint: '__Renderings', value: body('branch-retail', pages.Listing) },
]);
branchIds['Campaign launch'] = branch('Campaign launch', pageTypeIds.Landing, [
  { id: 'f1a1fe9e-a60c-4ddb-a3a0-bb5b29fe732e', hint: '__Renderings', value: body('branch-campaign', pages.Landing) },
]);
branchIds.Brand = branch('Brand', brandTemplate, [], brandFields);
for (const signature of SIGNATURES) {
  branchIds[`partial:${signature}`] = branch(`Partial ${signature}`, PARTIAL, [
    { id: '55faae90-3bba-4f7f-96fe-13c3f40055ff', hint: 'Signature', value: signature },
  ]);
}
for (const name of PAGE_TYPES) {
  branchIds[`design:${name}`] = branch(`Design ${name}`, PAGE_DESIGN, [
    {
      id: '0966b999-0d0e-4278-acc9-9da69d461fe6',
      hint: 'PartialDesigns',
      value: `${partialIds.header}|${partialIds[name.toLowerCase()]}|${partialIds.footer}`,
    },
  ]);
}

const contentJson = JSON.stringify([
  { name: 'Pages', content: 'Home, Landing, Listing, Detail, Article, Contact, Search' },
  { name: 'Uses', content: 'Real estate, retail, campaign' },
  { name: 'Components', content: 'Header, footer, hero, listing, article, contact' },
  { name: 'Integrations', content: 'Personalization and Analytics' },
]);

add(
  'project-settings/versatile/Templates.yml',
  itemYaml({
    itemId: id('folder:SolutionTemplates'),
    parent: PROJECT_SETTINGS,
    template: SETTINGS_FOLDER,
    path: '/sitecore/system/Settings/Project/versatile/Templates',
  }),
);
add(
  'project-settings/versatile/Templates/Versatile.yml',
  itemYaml({
    itemId: solutionId,
    parent: id('folder:SolutionTemplates'),
    template: SOLUTION,
    path: '/sitecore/system/Settings/Project/versatile/Templates/Versatile',
    shared: [
      { id: '82e64b52-0b8a-4a38-8c78-530c5493814e', hint: 'Name', value: 'Versatile' },
      {
        id: '9f437e68-a84d-48ae-8ce1-a3e26c0b5e64',
        hint: 'Description',
        value: 'One site template for real estate, retail, and campaign sites. Logo, colour, and type live on the site Brand item.',
      },
      { id: 'da855368-e5f2-4932-ae55-7f8b08a5a205', hint: 'Content', value: contentJson },
      {
        id: 'c262443b-653d-461d-96c8-7cfaa0ef2b2d',
        hint: 'Site Modules',
        value: [...BASIC_MODULES, setupId].map(brace).join('\n'),
      },
      { id: '41ac536a-923a-43f9-ac87-f3993f638125', hint: 'Tenant Modules', value: TENANT_MODULES.map(brace).join('\n') },
    ],
  }),
);
add(
  'project-settings/versatile/Versatile Setup.yml',
  itemYaml({
    itemId: setupId,
    parent: PROJECT_SETTINGS,
    template: SETUP_ROOT,
    path: '/sitecore/system/Settings/Project/versatile/Versatile Setup',
  }),
);

const actions = [
  ['Add Brand', branchIds.Brand, SETTINGS_PROTO, 'Brand'],
  ['Add Home', branchIds.Home, HOME_PROTO, 'Home'],
  ['Add Landing', branchIds.Landing, HOME_PROTO, 'Landing'],
  ['Add Listing', branchIds.Listing, HOME_PROTO, 'Listing'],
  ['Add Detail', branchIds.Detail, HOME_PROTO, 'Detail'],
  ['Add Article', branchIds.Article, HOME_PROTO, 'Article'],
  ['Add Contact', branchIds.Contact, HOME_PROTO, 'Contact'],
  ['Add Search', branchIds.Search, HOME_PROTO, 'Search'],
  ['Add Property showcase', branchIds['Property showcase'], HOME_PROTO, 'Property showcase'],
  ['Add Retail catalogue', branchIds['Retail catalogue'], HOME_PROTO, 'Retail catalogue'],
  ['Add Campaign launch', branchIds['Campaign launch'], HOME_PROTO, 'Campaign launch'],
  ['Add Data Folders', id('branch:Data folders'), DATA_PROTO, 'Data'],
];
for (const signature of SIGNATURES) {
  actions.push([`Add partial ${signature}`, branchIds[`partial:${signature}`], PARTIALS_PROTO, signature]);
}
for (const name of PAGE_TYPES) {
  actions.push([`Add page design ${name}`, branchIds[`design:${name}`], PAGE_DESIGNS_PROTO, name]);
}

branch('Data folders', FOLDER);

for (const [name, branchId, location, itemName] of actions) {
  add(
    `project-settings/versatile/Versatile Setup/${name}.yml`,
    itemYaml({
      itemId: id(`action:${name}`),
      parent: setupId,
      template: ADD_ITEM,
      path: `/sitecore/system/Settings/Project/versatile/Versatile Setup/${name}`,
      shared: [
        { id: 'e62c28f0-9d3b-46e2-8bec-a5e120542499', hint: 'Template', value: brace(branchId) },
        { id: '52c91c75-6698-4701-a8a2-242ace59a8d6', hint: 'Location', value: location },
        { id: '7868e6bc-525c-4fce-ab8a-77da3e09b171', hint: 'Name', value: itemName },
      ],
    }),
  );
}

add(
  'powershell/Versatile.yml',
  itemYaml({
    itemId: id('spe:Versatile'),
    parent: SPE_PARENT,
    template: SPE_MODULE,
    path: '/sitecore/system/Modules/PowerShell/Script Library/JSS SXA/Versatile',
  }),
);

async function patch(relativePath, mutate) {
  const full = join(ROOT, relativePath);
  const text = (await readFile(full, 'utf8')).replaceAll('\r\n', '\n');
  await writeFile(full, mutate(text).replaceAll('\n', '\r\n'), 'utf8');
}

await rm(join(ROOT, '.staging-versatile-preview'), { recursive: true, force: true });

for (const [relativePath, contents] of files) {
  const full = join(ROOT, relativePath);
  await mkdir(dirname(full), { recursive: true });
  await writeFile(full, contents, 'utf8');
}

await patch('templates/versatile/Page.yml', (text) => text.replace(
  '{4414A1F9-826A-4647-8DF4-ED6A95E64C43}',
  '{4414A1F9-826A-4647-8DF4-ED6A95E64C43}\n    {3F8A6A5D-7B1A-4566-8CD4-0A50F3030BD8}\n    {44A022DB-56D3-419A-B43B-E27E4D8E9C41}',
));

await patch('templates/versatile/Page/__Standard Values.yml', (text) => text.replace(
  'SharedFields:\n',
  `SharedFields:\n- ID: "ca9b9f52-4fb0-4f87-a79f-24dea62cda65"\n  Hint: __Default workflow\n  Value: "${BASIC_WORKFLOW}"\n`,
));

await patch('versatile-preview/versatile-preview/Presentation/Page Designs.yml', (text) => {
  const mapping = PAGE_TYPES.map((name) => encodeMapping(pageTypeIds[name], designIds[name])).join('%26');
  if (text.includes('ba1f60d6-3deb-40cc-bb61-eec772279ee1')) return text;
  return text.replace(
    'SharedFields:\n',
    `SharedFields:\n- ID: "ba1f60d6-3deb-40cc-bb61-eec772279ee1"\n  Hint: TemplatesMapping\n  Value: "${mapping}"\n`,
  );
});

await patch('versatile-preview/versatile-preview.yml', (text) => text
  .replace('{1F35559F-2140-4774-8BC1-525BB722BAA2}', `{1F35559F-2140-4774-8BC1-525BB722BAA2}\n    ${brace(setupId)}`)
  .replace('{2867D289-8951-458A-AF19-CE93A67BB494}', brace(solutionId)));

await patch('versatile-preview/versatile-preview/Settings/Site Grouping/versatile-preview.yml', (text) => text.replace(
  'Hint: HostName\n  Value: *',
  'Hint: HostName\n  Value: versatile-preview',
));

const modulePath = join(REPO, 'authoring', 'items', 'site-templates', 'versatile', 'versatile.module.json');
const moduleJson = JSON.parse(await readFile(modulePath, 'utf8'));
moduleJson.namespace = 'Project.Versatile';
moduleJson.items.includes.push({
  name: 'powershell',
  path: '/sitecore/system/Modules/PowerShell/Script Library/JSS SXA/Versatile',
  allowedPushOperations: 'CreateUpdateAndDelete',
  scope: 'ItemAndDescendants',
});
await writeFile(modulePath, `${JSON.stringify(moduleJson, null, 2)}\n`, 'utf8');

console.log(`Wrote ${files.size} Versatile items.`);
console.log(`Solution template ${solutionId}`);
console.log(`Setup ${setupId}`);
