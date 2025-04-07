<div align="center">
  <a href="https://github.com/VoKhuong/didiblunder">
    <img width="192" height="192" src="https://didiblunder.com/web-app-manifest-192x192.png" alt="Logo">
  </a>
  <h3 align="center">Did I Blunder</h3>
</div>

**Did I Blunder** is an open-source chess analysis web app available at [didiblunder.com](https://didiblunder.com/).

Enter your game as a PGN or import it directly from [chess.com](https://www.chess.com/home) or [lichess.org](https://lichess.org/) and it will generate a report of your game and classify all your moves.

## Developing

```bash
git clone https://github.com/VoKhuong/didiblunder.git
cd didiblunder

# or use pnpm or yarn
npm install
npm run dev
```

**NOTE**: You'll need to have a few environment variables defined in order to run and build the app

## Building

To create a production version of your app:

```bash
# or use pnpm or yarn
npm run build
```

You can preview the production build with `npm run preview`.

**NOTE**: Currently, Did I Blunder is heavily coupled with the Cloudflare adapter and is targeted for deployment on Cloudflare Pages.

## Environment Variables

Create a `.env` file in the root of your project by copying the `.env.example` file:

```bash
cp .env.example .env
```

## Acknowledgements

- [En Croissant](https://github.com/franciscoBSalgueiro/en-croissant) for the inspiration and a way to compute win percentage

## License

[MIT](https://choosealicense.com/licenses/mit/)
