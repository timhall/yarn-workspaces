import dedent from '@timhall/dedent/macro';

const help = dedent`
  Usage: knit workspace
`;

export default async function(argv: string[]) {
  console.log(help);
}
