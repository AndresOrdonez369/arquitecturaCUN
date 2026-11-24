// TURNO NOCTURNO
// Juego de consola para el curso Arquitectura de Videojuegos (CUN).
// ADVERTENCIA: este código está mal arquitecturado A PROPÓSITO. Funciona, y ese es el problema.
// Tu trabajo en el curso es diagnosticarlo (ACA 1) y rescatarlo (ACA 2). No lo imites.
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;

class Program
{
    static int jx = 20, jy = 18, vidas = 3, puntos = 0, oleada = 1, frame = 0, porSalir = 8, record = 0;
    static bool menu = true, pausa = false, gameOver = false, gano = false;
    static List<int> enemX = new List<int>();
    static List<int> enemY = new List<int>();
    static List<string> enemTipo = new List<string>();
    static List<int> enemHp = new List<int>();
    static List<int> balasX = new List<int>();
    static List<int> balasY = new List<int>();
    static List<int> batX = new List<int>();
    static List<int> batY = new List<int>();
    static Random rnd = new Random();

    static void Main()
    {
        Console.CursorVisible = false;
        Console.Clear();
        if (File.Exists("puntaje.txt"))
        {
            try { record = int.Parse(File.ReadAllText("puntaje.txt")); } catch { record = 0; }
        }

        while (true)
        {
            // ---------------- teclado ----------------
            while (Console.KeyAvailable)
            {
                ConsoleKey k = Console.ReadKey(true).Key;
                if (k == ConsoleKey.Escape) { Console.CursorVisible = true; Console.Clear(); return; }
                if (menu)
                {
                    if (k == ConsoleKey.Enter) menu = false;
                }
                else if (gameOver || gano)
                {
                    if (k == ConsoleKey.Enter)
                    {
                        jx = 20; jy = 18; vidas = 3; puntos = 0; oleada = 1; frame = 0; porSalir = 8;
                        gameOver = false; gano = false; pausa = false;
                        enemX.Clear(); enemY.Clear(); enemTipo.Clear(); enemHp.Clear();
                        balasX.Clear(); balasY.Clear(); batX.Clear(); batY.Clear();
                    }
                }
                else
                {
                    if (k == ConsoleKey.P) pausa = !pausa;
                    if (!pausa)
                    {
                        if (k == ConsoleKey.LeftArrow && jx > 1) jx--;
                        if (k == ConsoleKey.RightArrow && jx < 38) jx++;
                        if (k == ConsoleKey.UpArrow && jy > 10) jy--;
                        if (k == ConsoleKey.DownArrow && jy < 18) jy++;
                        if (k == ConsoleKey.Spacebar)
                        {
                            balasX.Add(jx); balasY.Add(jy - 1);
                            Console.Beep();
                        }
                    }
                }
            }

            // ---------------- lógica ----------------
            if (!menu && !pausa && !gameOver && !gano)
            {
                frame++;

                // aparecen bichos
                if (porSalir > 0 && frame % 12 == 0)
                {
                    int r = rnd.Next(100);
                    string t = "lento";
                    if (oleada == 1) { if (r > 80) t = "rapido"; }
                    if (oleada == 2) { if (r > 50) t = "rapido"; if (r > 85) t = "tanque"; }
                    if (oleada == 3) { if (r > 40) t = "rapido"; if (r > 70) t = "tanque"; }
                    enemX.Add(rnd.Next(1, 39)); enemY.Add(1); enemTipo.Add(t);
                    if (t == "tanque") enemHp.Add(3); else enemHp.Add(1);
                    porSalir--;
                }

                // se mueven los bichos
                for (int i = 0; i < enemX.Count; i++)
                {
                    if (enemTipo[i] == "lento") { if (frame % 6 == 0) enemY[i]++; }
                    if (enemTipo[i] == "rapido")
                    {
                        if (frame % 3 == 0)
                        {
                            enemY[i]++;
                            enemX[i] += rnd.Next(-1, 2);
                            if (enemX[i] < 1) enemX[i] = 1;
                            if (enemX[i] > 38) enemX[i] = 38;
                        }
                    }
                    if (enemTipo[i] == "tanque") { if (frame % 9 == 0) enemY[i]++; }
                }

                // caen baterías
                if (frame % 150 == 0) { batX.Add(rnd.Next(1, 39)); batY.Add(1); }
                for (int i = 0; i < batY.Count; i++) { if (frame % 4 == 0) batY[i]++; }

                // suben las chispas
                for (int i = balasY.Count - 1; i >= 0; i--)
                {
                    balasY[i]--;
                    if (balasY[i] < 1) { balasX.RemoveAt(i); balasY.RemoveAt(i); }
                }

                // chispa contra bicho
                for (int i = balasX.Count - 1; i >= 0; i--)
                {
                    for (int j = enemX.Count - 1; j >= 0; j--)
                    {
                        if (balasX[i] == enemX[j] && (balasY[i] == enemY[j] || balasY[i] == enemY[j] - 1))
                        {
                            enemHp[j]--;
                            balasX.RemoveAt(i); balasY.RemoveAt(i);
                            if (enemHp[j] <= 0)
                            {
                                if (enemTipo[j] == "lento") puntos += 10;
                                if (enemTipo[j] == "rapido") puntos += 20;
                                if (enemTipo[j] == "tanque") puntos += 50;
                                enemX.RemoveAt(j); enemY.RemoveAt(j); enemTipo.RemoveAt(j); enemHp.RemoveAt(j);
                                Console.Beep();
                                if (puntos > record)
                                {
                                    record = puntos;
                                    File.WriteAllText("puntaje.txt", record.ToString());
                                }
                            }
                            break;
                        }
                    }
                }

                // bicho toca al robot o llega al fondo
                for (int j = enemX.Count - 1; j >= 0; j--)
                {
                    if ((enemX[j] == jx && enemY[j] == jy) || enemY[j] >= 19)
                    {
                        vidas--;
                        enemX.RemoveAt(j); enemY.RemoveAt(j); enemTipo.RemoveAt(j); enemHp.RemoveAt(j);
                        Console.Beep();
                        if (vidas <= 0)
                        {
                            gameOver = true;
                            File.WriteAllText("puntaje.txt", record.ToString());
                        }
                    }
                }

                // baterías
                for (int i = batX.Count - 1; i >= 0; i--)
                {
                    if (batX[i] == jx && batY[i] == jy)
                    {
                        if (vidas < 5) vidas++;
                        puntos += 5;
                        batX.RemoveAt(i); batY.RemoveAt(i);
                        Console.Beep();
                    }
                    else if (batY[i] >= 19) { batX.RemoveAt(i); batY.RemoveAt(i); }
                }

                // ¿se acabó la oleada?
                if (porSalir == 0 && enemX.Count == 0 && !gameOver)
                {
                    oleada++;
                    if (oleada > 3)
                    {
                        gano = true;
                        File.WriteAllText("puntaje.txt", record.ToString());
                    }
                    else
                    {
                        if (oleada == 2) porSalir = 14;
                        if (oleada == 3) porSalir = 20;
                    }
                }
            }

            // ---------------- dibujo ----------------
            List<string> lineas = new List<string>();
            string hud = "TURNO NOCTURNO   Vidas: " + vidas + "   Puntos: " + puntos + "   Oleada: " + oleada + "/3   Record: " + record;
            lineas.Add(hud.PadRight(70));
            for (int y = 0; y < 20; y++)
            {
                string fila = "";
                for (int x = 0; x < 40; x++)
                {
                    string c = " ";
                    if (y == 0 || y == 19) c = "=";
                    else if (x == 0 || x == 39) c = "|";
                    for (int i = 0; i < batX.Count; i++) { if (batX[i] == x && batY[i] == y) c = "+"; }
                    for (int i = 0; i < balasX.Count; i++) { if (balasX[i] == x && balasY[i] == y) c = "*"; }
                    for (int i = 0; i < enemX.Count; i++)
                    {
                        if (enemX[i] == x && enemY[i] == y)
                        {
                            if (enemTipo[i] == "lento") c = "b";
                            if (enemTipo[i] == "rapido") c = "B";
                            if (enemTipo[i] == "tanque") c = "M";
                        }
                    }
                    if (x == jx && y == jy) c = "@";
                    fila = fila + c;
                }
                lineas.Add(fila);
            }
            string msg = "Flechas: mover   Espacio: chispa   P: pausa   Esc: salir";
            if (menu) msg = "ENTER para empezar el turno. Espanta los bichos antes de que lleguen abajo.";
            if (pausa) msg = "PAUSA. Presiona P para continuar.";
            if (gameOver) msg = "GAME OVER. Los bichos se comieron los cables. ENTER para reintentar.";
            if (gano) msg = "AMANECIO. Sobreviviste al turno. ENTER para jugar de nuevo.";
            lineas.Add(msg.PadRight(78));

            Console.SetCursorPosition(0, 0);
            for (int i = 0; i < lineas.Count; i++) Console.WriteLine(lineas[i]);

            Thread.Sleep(50);
        }
    }
}
