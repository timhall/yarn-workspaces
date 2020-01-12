import dedent from '@timhall/dedent/macro';

const help = dedent`
  Usage: knit dependencies
`;

export default async function(argv: string[]) {
  console.log(help);
}
